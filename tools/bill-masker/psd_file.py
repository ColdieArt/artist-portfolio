"""Write a layered Photoshop (.psd) file without needing Photoshop.

The file has two layers:
  "Bill"           the cut-out bill, with the mask as an editable layer mask
  "Original scan"  the untouched scan underneath, hidden, for comparison

Layout follows Adobe's published PSD file format specification. Channel data is
RLE (PackBits) compressed, which every Photoshop version reads.
"""

import re
import struct

import numpy as np

_RUN = re.compile(rb"(.)\1{2,}", re.S)  # three or more identical bytes


def _packbits_row(row):
    out = bytearray()

    def literal(chunk):
        for i in range(0, len(chunk), 128):
            part = chunk[i:i + 128]
            out.append(len(part) - 1)
            out.extend(part)

    pos = 0
    for m in _RUN.finditer(row):
        literal(row[pos:m.start()])
        value, length = m.group(1)[0], m.end() - m.start()
        while length >= 2:
            n = min(length, 128)
            out.append(257 - n)  # -(n - 1) as an unsigned byte
            out.append(value)
            length -= n
        if length == 1:
            literal(bytes([value]))
        pos = m.end()
    literal(row[pos:])
    return bytes(out)


def _rle_channel(plane):
    """Compressed channel: (row byte-count table, packed rows)."""
    rows = [_packbits_row(plane[y].tobytes()) for y in range(plane.shape[0])]
    counts = struct.pack(f">{len(rows)}H", *(len(r) for r in rows))
    return counts, b"".join(rows)


def _pascal(name, pad):
    raw = name.encode("latin-1")[:255]
    data = bytes([len(raw)]) + raw
    return data + b"\0" * (-len(data) % pad)


def _layer(name, planes, hidden=False, mask=None):
    """Return (record bytes, channel data bytes) for one full-canvas layer."""
    h, w = planes[0][1].shape
    channels = list(planes) + ([(-2, mask)] if mask is not None else [])

    data = bytearray()
    info = bytearray()
    for cid, plane in channels:
        counts, packed = _rle_channel(plane)
        blob = struct.pack(">H", 1) + counts + packed
        info += struct.pack(">hI", cid, len(blob))
        data += blob

    extra = bytearray()
    if mask is not None:
        extra += struct.pack(">I", 20) + struct.pack(">iiii", 0, 0, h, w) + bytes([0, 0]) + b"\0\0"
    else:
        extra += struct.pack(">I", 0)
    extra += struct.pack(">I", 0)  # no blending ranges
    extra += _pascal(name, 4)

    flags = 0x02 if hidden else 0x00
    record = (struct.pack(">iiiiH", 0, 0, h, w, len(channels)) + bytes(info)
              + b"8BIMnorm" + bytes([255, 0, flags, 0])
              + struct.pack(">I", len(extra)) + bytes(extra))
    return record, bytes(data)


def _resource(rid, data):
    data += b"\0" * (len(data) % 2)
    return b"8BIM" + struct.pack(">H", rid) + b"\0\0" + struct.pack(">I", len(data)) + data


def write_psd(path, bill_rgb, mask, original_rgb, composite_rgb, dpi, icc=None):
    """All images are uint8 arrays of the same height and width."""
    h, w = mask.shape
    opaque = np.full((h, w), 255, np.uint8)

    bottom = _layer("Original scan", [(-1, opaque)] + [(c, original_rgb[..., c]) for c in range(3)],
                    hidden=True)
    top = _layer("Bill", [(-1, opaque)] + [(c, bill_rgb[..., c]) for c in range(3)], mask=mask)

    layers = struct.pack(">h", 2) + bottom[0] + top[0] + bottom[1] + top[1]
    layers += b"\0" * (len(layers) % 2)
    layer_info = struct.pack(">I", len(layers)) + layers
    layer_section = layer_info + struct.pack(">I", 0)  # no global layer mask

    fixed = int(round(dpi * 65536))
    res = struct.pack(">IHHIHH", fixed, 1, 1, fixed, 1, 1)
    resources = _resource(0x03ED, res)
    if icc:
        resources += _resource(0x040F, icc)  # embedded colour profile

    with open(path, "wb") as f:
        f.write(b"8BPS" + struct.pack(">H6xHIIHH", 1, 3, h, w, 8, 3))
        f.write(struct.pack(">I", 0))                          # colour mode data
        f.write(struct.pack(">I", len(resources)) + resources)  # resolution
        f.write(struct.pack(">I", len(layer_section)) + layer_section)
        # Flattened preview, used by apps that don't read layers.
        counts, packed = zip(*(_rle_channel(composite_rgb[..., c]) for c in range(3)))
        f.write(struct.pack(">H", 1) + b"".join(counts) + b"".join(packed))
