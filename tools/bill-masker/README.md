# Bill masker

Cuts each scanned bill out of its white scanner background, keeping every frayed
fibre and torn edge. Holes through the bill become see-through as well.

## What you get for each scan

| File | Use it for |
| --- | --- |
| `name.png` | Full-size bill on a see-through background, at the scan's DPI (prints, NFT master) |
| `name-mask.png` | Black and white mask for Photoshop (white = bill) |
| `name-web.webp` | Lighter see-through copy, 2400 px on the long side (website) |
| `name-check.jpg` | Review sheet: the bill over black, over magenta, and any dust it removed shown in red |

## How it decides what is background

- **Background colour.** It's measured all around the bill, because a scanner bed is never perfectly even.
- **Edge shadow.** A torn bill doesn't lie flat, so its edges cast a soft grey
  shadow on the glass. Grey that is soft and wide counts as shadow and is removed.
  Fibres and hairs are thin and sharp, so they're kept even where they cross the shadow.
- **Soft edges.** A pixel that is only partly paper, such as a fibre or the blurred
  outer edge, becomes partly see-through, and the white is taken out of its colour
  so there's no pale outline.
- **Dust.** Specks sitting on the glass more than 1.5 mm from the bill are removed
  (they show in red on the review sheet). Anything closer is kept as part of the bill.

## Running it

```
pip install -r requirements.txt
python3 mask_bills.py scans/ masked/
```

Options:

- `--dpi 1200` sets the resolution, only needed if the scan files don't record it.
- `--keep-mm 3` keeps loose specks up to 3 mm from the bill instead of 1.5 mm.

Put the scans in `scans/` and the results land in `masked/`. Both folders stay
out of git because the files are large.
