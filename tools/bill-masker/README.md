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
- **No white edges.** Every pixel along an edge takes the colour of the bill
  paper right beside it, so the bill goes straight from its own colour to
  see-through, with no white or grey outline.
- **Holes.** The bill sits slightly above the glass, so a hole shows grey,
  colourless background. Colourless light patches inside the bill are cut out.
- **Hairs and strands** sticking out of the bill are kept, in the bill's colour.
- **Dust.** Every loose speck that isn't attached to the bill is removed. Torn-off
  pieces bigger than 20 mm² are kept. The review sheet shows what was cut out (dust and holes) in red.

## Running it

```
pip install -r requirements.txt
python3 mask_bills.py scans/ masked/
```

Options:

- `--dpi 1200` sets the resolution, only needed if the scan files don't record it.
- `--keep-mm 2` keeps loose specks within 2 mm of the bill (by default they're all removed).

Put the scans in `scans/` and the results land in `masked/`. Both folders stay
out of git because the files are large.
