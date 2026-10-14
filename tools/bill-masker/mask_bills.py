#!/usr/bin/env python3
"""Cut scanned bills out of their scanner background.

For every scan in the input folder this writes, into the output folder:

  <name>.png        full-resolution bill with a see-through background (prints, NFT masters)
  <name>-mask.png   black/white mask for Photoshop (white = bill, black = background)
  <name>-web.webp   smaller see-through copy for the website
  <name>-check.jpg  review sheet: the cut-out over black and over magenta, plus
                    anything that was removed as scanner dust shown in red

How it works, in short: the scanner background is plain off-white, so the
background colour is measured around the whole bill (it drifts a little across
the scanner bed), and every pixel is judged by how different it is from the
background right behind it. Pixels that are only partly paper - frayed fibres,
the soft outer edge - become partly see-through instead of being cut off, and
their colour is cleaned so no white fringe is left behind. Holes in the bill
become see-through the same way, because they show the background colour.

Usage:
  python3 mask_bills.py INPUT_FOLDER OUTPUT_FOLDER [--dpi 1200]
  python3 mask_bills.py scan.tif OUTPUT_FOLDER
"""

import argparse
import sys
from pathlib import Path

import numpy as np
import tifffile
from PIL import Image
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None  # 1200 DPI scans are large; they are trusted local files

SCAN_EXTENSIONS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}
WEB_LONG_EDGE = 2400


def load_scan(path):
    """Return (rgb float array 0-255, dpi or None)."""
    with Image.open(path) as im:
        dpi = im.info.get("dpi")
        dpi = float(dpi[0]) if dpi and dpi[0] > 1 else None
        if path.suffix.lower() not in (".tif", ".tiff"):
            return np.asarray(im.convert("RGB"), dtype=np.float32), dpi

    # TIFF scans are often 16 bits per channel, which tifffile reads reliably.
    arr = tifffile.imread(path)
    if arr.ndim == 2:
        arr = np.repeat(arr[..., None], 3, axis=2)
    rgb = arr[..., :3].astype(np.float32)
    if arr.dtype == np.uint16:
        rgb /= 257.0
    return rgb, dpi


def edge_blur_px(scale):
    """How far the scanner smears a paper edge, in pixels."""
    return max(4, int(round(16 * scale)))


def smooth_fill(values, weights, sigma):
    """Blur `values` using only pixels where weights > 0, filling the gaps."""
    num = ndimage.gaussian_filter(values * weights, sigma)
    den = ndimage.gaussian_filter(weights, sigma)
    return num / np.maximum(den, 1e-6), den


def estimate_background(rgb, scale):
    """Model the scanner background as a smooth colour field behind the bill."""
    h, w, _ = rgb.shape
    border = np.concatenate([rgb[:20].reshape(-1, 3), rgb[-20:].reshape(-1, 3),
                             rgb[:, :20].reshape(-1, 3), rgb[:, -20:].reshape(-1, 3)])
    global_bg = np.median(border, axis=0)

    # Work on a small copy: the background changes slowly, so this is plenty.
    step = max(1, int(round(8 * scale)))
    small = rgb[::step, ::step]
    dist = np.linalg.norm(small - global_bg, axis=2)
    is_bg = (dist < 22).astype(np.float64)
    # Shrink the background region so pixels right at the bill edge don't skew it.
    is_bg = ndimage.binary_erosion(is_bg, iterations=2).astype(np.float64)

    # Under the bill the background can't be seen, so carry in the colour of the
    # nearest visible background, then smooth it.
    _, (iy, ix) = ndimage.distance_transform_edt(is_bg == 0, return_indices=True)
    filled = small[iy, ix]
    field = np.empty_like(small)
    for c in range(3):
        field[..., c], _ = smooth_fill(filled[..., c], np.ones(is_bg.shape), sigma=6)

    # Back up to full size.
    zoom = (h / field.shape[0], w / field.shape[1], 1)
    field = ndimage.zoom(field, zoom, order=1)[:h, :w]
    if field.shape[:2] != (h, w):
        field = np.pad(field, ((0, h - field.shape[0]), (0, w - field.shape[1]), (0, 0)), mode="edge")

    residual = np.linalg.norm(small - field[::step, ::step][: small.shape[0], : small.shape[1]], axis=2)
    noise = float(np.std(residual[is_bg > 0])) if is_bg.any() else 1.5
    return field, noise


def add_edge_shadow(rgb, bg, noise, scale, dpi):
    """Fold the soft grey shadow the bill casts on the glass into the background.

    Torn bills don't lie flat, so their edges cast a blurry grey shadow. It is
    neutral grey, wide and smooth, whereas paper is beige and loose fibres are
    thin and sharp. Only smooth grey areas that join up with clear background
    are treated as shadow, so fibres lying in the shadow are kept.
    """
    diff = rgb - bg
    mean = diff.mean(axis=2)
    dark = np.maximum(-mean, 0.0)
    colourfulness = np.linalg.norm(diff - mean[..., None], axis=2)

    neutral = colourfulness < max(5.0, 3.0 * noise)
    clear = neutral & (dark < max(4.0, 3.5 * noise))

    # Smooth floor of the darkness: anything thinner than the window (fibres,
    # hairs) is lifted out; a broad soft shadow stays.
    window = max(5, int(round(25 * scale)) | 1)
    floor = ndimage.grey_opening(dark, size=(window, window))

    # Shadow = neutral, softly darkened areas that join up with clear
    # background. Grey patches enclosed by paper are left alone.
    candidate = neutral & (floor <= 40.0)
    labels, _ = ndimage.label(candidate, structure=np.ones((3, 3)))
    touching = np.unique(labels[clear & candidate])
    region = np.isin(labels, touching[touching > 0])
    shadow = np.where(region, np.minimum(floor, 40.0), 0.0)

    # The shadow carries on under the blurred outer edge of the paper; extend
    # it a short way so those edge pixels are judged against the grey they sit on.
    sigma = max(1.0, 3.0 * scale)
    extended, support = smooth_fill(shadow, region.astype(np.float64), sigma)
    edge = ndimage.binary_dilation(region, iterations=edge_blur_px(scale)) & ~region
    shadow = np.where(edge & (support > 0.02), extended, shadow)
    shadow = ndimage.gaussian_filter(shadow, max(0.7, scale))
    return bg - shadow[..., None]


def paper_difference(rgb, bg):
    """How a pixel differs from the background, ignoring any brightening.

    Paper is always darker and/or more coloured than the scanner background.
    The glass right next to the bill often scans a little brighter than the
    rest, and that brighter strip must not be mistaken for paper.
    """
    diff = rgb - bg
    brighter = np.maximum(diff.mean(axis=2, keepdims=True), 0.0)
    return diff - brighter


def build_alpha(rgb, bg, noise, scale, paper_floor):
    """Opacity per pixel: 0 = background, 1 = solid bill, in between = fibres / soft edge."""
    diff = paper_difference(rgb, bg)
    dist = np.linalg.norm(diff, axis=2)

    lo = max(4.0, 3.5 * noise)          # below this it's just scanner noise
    hi = max(lo + 6.0, paper_floor)     # the palest paper on the bill is at least this different
    alpha = np.clip((dist - lo) / (hi - lo), 0.0, 1.0)

    # Soft-edge refinement: at the outer edge a pixel is a blend of paper and
    # background. Compare it with solid paper just inside the edge to work out
    # how much paper it really holds.
    blur = edge_blur_px(scale)
    solid = ndimage.binary_erosion(alpha >= 1.0, iterations=max(1, int(round(2 * scale))))
    sigma = float(blur)
    fg = np.empty(rgb.shape, dtype=np.float32)
    for c in range(3):
        fg[..., c], support = smooth_fill(rgb[..., c], solid.astype(np.float64), sigma)
    fg_diff = fg - bg
    fg_len2 = np.sum(fg_diff ** 2, axis=2)
    proj = np.clip(np.sum(diff * fg_diff, axis=2) / np.maximum(fg_len2, 1e-6), 0.0, 1.0)

    # Blended pixels only exist right next to true background (the scanner's
    # optical blur is only a few pixels wide), so only refine there. Further in, pale
    # paper and loose fibres keep their full strength.
    near_bg = ndimage.binary_dilation(alpha <= 0.0, iterations=blur)
    trusted = near_bg & ~solid & (alpha > 0) & (support > 0.05) & (np.sqrt(fg_len2) > dist)
    refined = alpha.copy()
    refined[trusted] = np.minimum(alpha[trusted], proj[trusted])
    return refined, fg, support


def remove_dust(alpha, scale, keep_mm, dpi):
    """Drop specks floating in the background far from the bill. Returns (alpha, removed_mask)."""
    present = alpha > 0.02
    labels, n = ndimage.label(present, structure=np.ones((3, 3)))
    if n <= 1:
        return alpha, np.zeros_like(present)
    sizes = ndimage.sum(present, labels, index=np.arange(1, n + 1))
    main = labels == (int(np.argmax(sizes)) + 1)
    keep_px = keep_mm / 25.4 * dpi
    far = ndimage.distance_transform_edt(~main) > keep_px
    # A speck goes only if every pixel of it is far from the bill.
    near_ids = np.unique(labels[present & ~far])
    removed = present & ~main & ~np.isin(labels, near_ids)
    out = alpha.copy()
    out[removed] = 0.0
    return out, removed


def clean_colours(rgb, bg, alpha, fg, fg_support):
    """Take the background colour back out of partly see-through pixels (no white fringe)."""
    a = alpha[..., None]
    with np.errstate(divide="ignore", invalid="ignore"):
        unmixed = bg + (rgb - bg) / np.maximum(a, 1e-3)
    unmixed = np.clip(unmixed, 0, 255)
    # Very faint pixels have too little signal to unmix; lean on nearby paper
    # colour where there is some.
    weight = np.clip((a - 0.05) / 0.25, 0, 1)
    fallback = np.where(fg_support[..., None] > 0.05, fg, unmixed)
    out = np.where(a >= 1.0, rgb, weight * unmixed + (1 - weight) * fallback)
    return np.clip(out, 0, 255)


def save_outputs(name, rgb, alpha, removed, out_dir, dpi):
    rgba = np.dstack([rgb, alpha * 255.0]).round().astype(np.uint8)
    mask = (alpha * 255.0).round().astype(np.uint8)
    dpi_info = (dpi, dpi)

    full = Image.fromarray(rgba, "RGBA")
    full.save(out_dir / f"{name}.png", dpi=dpi_info, optimize=False, compress_level=6)
    Image.fromarray(mask, "L").save(out_dir / f"{name}-mask.png", dpi=dpi_info)

    web = full.copy()
    web.thumbnail((WEB_LONG_EDGE, WEB_LONG_EDGE), Image.LANCZOS)
    web.save(out_dir / f"{name}-web.webp", quality=90, method=6)

    # Review sheet: over black, over magenta, and dust that was removed in red.
    a = alpha[..., None]
    on_black = rgb * a
    on_magenta = rgb * a + np.array([255.0, 0.0, 200.0]) * (1 - a)
    removed_view = on_black.copy()
    removed_view[ndimage.binary_dilation(removed, iterations=3)] = [255, 0, 0]
    sheet = np.concatenate([on_black, on_magenta, removed_view], axis=0).astype(np.uint8)
    check = Image.fromarray(sheet)
    check.thumbnail((3000, 3000), Image.LANCZOS)
    check.save(out_dir / f"{name}-check.jpg", quality=88)


def process(path, out_dir, dpi_override, keep_mm):
    rgb, file_dpi = load_scan(path)
    dpi = dpi_override or file_dpi or 1200.0
    scale = max(dpi / 1200.0, 0.25)  # pixel distances below are tuned for 1200 DPI

    bg, noise = estimate_background(rgb, scale)
    bg = add_edge_shadow(rgb, bg, noise, scale, dpi)
    alpha, fg, fg_support = build_alpha(rgb, bg, noise, scale, paper_floor=24.0)
    alpha, removed = remove_dust(alpha, scale, keep_mm, dpi)
    colour = clean_colours(rgb, bg, alpha, fg, fg_support)
    save_outputs(path.stem, colour, alpha, removed, out_dir, dpi)

    h, w = alpha.shape
    print(f"{path.name}: {w}x{h}px @ {dpi:.0f} DPI, background noise {noise:.1f}, "
          f"dust specks removed: {int(ndimage.label(removed)[1])}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", type=Path, help="a scan, or a folder of scans")
    ap.add_argument("output", type=Path, help="folder for the results")
    ap.add_argument("--dpi", type=float, help="scan resolution, if the files don't record it (default 1200)")
    ap.add_argument("--keep-mm", type=float, default=1.5,
                    help="specks closer than this to the bill are kept as part of it (default 1.5 mm)")
    args = ap.parse_args()

    files = [args.input] if args.input.is_file() else sorted(
        p for p in args.input.iterdir() if p.suffix.lower() in SCAN_EXTENSIONS)
    if not files:
        sys.exit(f"No scans found in {args.input}")
    args.output.mkdir(parents=True, exist_ok=True)
    for f in files:
        process(f, args.output, args.dpi, args.keep_mm)


if __name__ == "__main__":
    main()
