#!/usr/bin/env python3
"""Cut scanned bills out of their scanner background.

For every scan in the input folder this writes, into the output folder:

  <name>.png        full-resolution bill with a see-through background (prints, NFT masters)
  <name>-mask.png   black/white mask for Photoshop (white = bill, black = background)
  <name>-web.webp   smaller see-through copy for the website
  <name>-check.jpg  review sheet: the cut-out over black and over magenta, plus
                    the dust and holes that were cut out shown in red

How it works, in short: the scanner background is plain off-white, so the
background colour is measured around the whole bill (it drifts a little across
the scanner bed), along with the soft grey shadow the torn edges cast on the
glass. Every pixel is judged against the background right behind it. Edge
pixels take the colour of the paper right beside them, so the bill goes
straight from its own colour to see-through with no white in between. Holes
through the bill are cut out, hairs and strands attached to the bill are kept,
and every loose speck on the glass is removed.

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


def rough_alpha(rgb, bg, noise, paper_floor):
    """First pass: 0 = background, 1 = paper, in between = faint."""
    diff = paper_difference(rgb, bg)
    dist = np.linalg.norm(diff, axis=2)
    lo = max(4.0, 3.5 * noise)          # below this it's just scanner noise
    hi = max(lo + 6.0, paper_floor)     # the palest paper on the bill is at least this different
    return np.clip((dist - lo) / (hi - lo), 0.0, 1.0), diff, dist


def cut_holes(rgb, bg, alpha, noise, scale, dpi):
    """Make holes through the bill see-through.

    The bill sits slightly above the glass, so a hole shows background in
    shadow: grey rather than white, but just as colourless. Paper and dirt are
    always tinted (beige, brown, green) or much darker, so a colourless, light
    patch inside the bill is a hole. Only the body of the bill is searched:
    hairs and strands sticking out are pale too, and must be kept.
    """
    diff = rgb - bg
    mean = diff.mean(axis=2)
    colourfulness = np.linalg.norm(diff - mean[..., None], axis=2)
    window = max(3, int(round(8 * scale)) | 1)
    body = ndimage.binary_opening(alpha >= 0.5, structure=np.ones((window, window)))
    hole = body & (colourfulness < max(7.0, 4.0 * noise)) & (-mean < 75.0)
    hole = ndimage.binary_opening(hole, iterations=1)          # ignore single stray pixels
    min_px = (0.08 / 25.4 * dpi) ** 2                          # smaller than ~0.08 mm across is noise
    labels, n = ndimage.label(hole)
    if n:
        sizes = ndimage.sum(hole, labels, index=np.arange(1, n + 1))
        hole = np.isin(labels, np.flatnonzero(sizes >= min_px) + 1)
    # Take in the slightly tinted rim around each hole as well.
    rim = body & (colourfulness < 14.0) & (-mean < 110.0)
    hole = ndimage.binary_propagation(hole, mask=rim | hole)
    hole = ndimage.binary_dilation(hole, iterations=max(1, int(round(2 * scale))))
    out = alpha.copy()
    out[hole] = 0.0
    return out, hole


def remove_dust(alpha, dpi, keep_mm, piece_mm2=20.0):
    """Remove every speck not attached to the bill. Returns (alpha, removed_mask).

    Separate pieces bigger than `piece_mm2` (a torn-off corner, say) are kept.
    With keep_mm > 0, specks that close to the bill are kept too.
    """
    present = alpha > 0.02
    labels, n = ndimage.label(present, structure=np.ones((3, 3)))
    if n <= 1:
        return alpha, np.zeros_like(present)
    sizes = ndimage.sum(present, labels, index=np.arange(1, n + 1))
    px_per_mm = dpi / 25.4
    keep_ids = set((np.flatnonzero(sizes >= piece_mm2 * px_per_mm ** 2) + 1).tolist())
    keep_ids.add(int(np.argmax(sizes)) + 1)
    kept = np.isin(labels, list(keep_ids))
    if keep_mm > 0:
        near = ndimage.distance_transform_edt(~kept) <= keep_mm * px_per_mm
        kept |= np.isin(labels, np.unique(labels[present & near]))
    removed = present & ~kept
    out = alpha.copy()
    out[removed] = 0.0
    return out, removed


def finish_edges(rgb, bg, alpha, diff, dist, scale):
    """Give every edge pixel the bill's own colour, so nothing white is left.

    Along any edge (outside, holes, fibres) the scanner blends paper with the
    background. Each such pixel is matched with the solid paper right beside
    it: it takes that paper's colour, and its opacity says how much paper it
    held. Edge pixels at least as strong as the paper beside them (ink running
    up to a tear, say) keep their own colour.
    """
    band = edge_blur_px(scale)
    near_edge = ndimage.distance_transform_edt(alpha > 0) <= band
    core = (alpha >= 1.0) & ~near_edge & (dist >= 40.0)
    if not core.any():
        return rgb, alpha

    # Colour of the nearest solid paper, lightly averaged so it isn't blotchy.
    _, (iy, ix) = ndimage.distance_transform_edt(~core, return_indices=True)
    paper = rgb[iy, ix]
    avg = np.empty_like(paper)
    for c in range(3):
        avg[..., c], support = smooth_fill(rgb[..., c], core.astype(np.float32), band / 2)
    paper = np.where(support[..., None] > 0.1, avg, paper)

    paper_diff = paper - bg
    strength = np.sum(diff * paper_diff, axis=2) / np.maximum(np.sum(paper_diff ** 2, axis=2), 1e-6)
    strength = np.clip(strength, 0.0, 1.0)

    edge = near_edge & (alpha > 0) & (strength < 0.95)
    out_alpha = alpha.copy()
    out_alpha[edge] = np.minimum(alpha[edge], strength[edge])
    colour = rgb.copy()
    colour[edge] = paper[edge]
    return colour, out_alpha


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
    alpha, diff, dist = rough_alpha(rgb, bg, noise, paper_floor=24.0)
    alpha, removed = remove_dust(alpha, dpi, keep_mm)
    alpha, holes = cut_holes(rgb, bg, alpha, noise, scale, dpi)
    colour, alpha = finish_edges(rgb, bg, alpha, diff, dist, scale)
    save_outputs(path.stem, colour, alpha, removed | holes, out_dir, dpi)

    h, w = alpha.shape
    print(f"{path.name}: {w}x{h}px @ {dpi:.0f} DPI, background noise {noise:.1f}, "
          f"dust specks removed: {int(ndimage.label(removed)[1])}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("input", type=Path, help="a scan, or a folder of scans")
    ap.add_argument("output", type=Path, help="folder for the results")
    ap.add_argument("--dpi", type=float, help="scan resolution, if the files don't record it (default 1200)")
    ap.add_argument("--keep-mm", type=float, default=0.0,
                    help="keep loose specks within this distance of the bill (default 0: remove them all)")
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
