#!/usr/bin/env python3
"""Compose display covers from existing screenshots. Does not modify originals or article evidence."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/images/projects'


def solve(rows):
    m = [list(map(float, row)) for row in rows]
    n = len(m)
    for col in range(n):
        pivot = max(range(col, n), key=lambda r: abs(m[r][col]))
        m[col], m[pivot] = m[pivot], m[col]
        if abs(m[col][col]) < 1e-8:
            raise RuntimeError('singular perspective')
        scale = m[col][col]
        m[col] = [v / scale for v in m[col]]
        for r in range(n):
            if r == col:
                continue
            factor = m[r][col]
            m[r] = [m[r][c] - factor * m[col][c] for c in range(n + 1)]
    return [m[i][n] for i in range(n)]


def perspective_coeffs(input_pts, output_pts):
    rows = []
    for (u, v), (x, y) in zip(input_pts, output_pts):
        rows.append([x, y, 1, 0, 0, 0, -u * x, -u * y, u])
        rows.append([0, 0, 0, x, y, 1, -v * x, -v * y, v])
    return solve(rows)


def load(path, max_w):
    im = Image.open(ROOT / path).convert('RGB')
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.Resampling.LANCZOS)
    return im


def radial(size, inner, outer, center, power=1.15):
    w, h = size
    cx, cy = center
    span = (w * w + h * h) ** 0.5
    mask = Image.new('L', size)
    px = mask.load()
    for y in range(h):
        dy = (y - cy) * (y - cy)
        for x in range(w):
            d = ((x - cx) * (x - cx) + dy) ** 0.5 / span
            px[x, y] = int(max(0, min(255, (1 - d) ** power * 255)))
    return Image.composite(Image.new('RGB', size, inner), Image.new('RGB', size, outer), mask)


def place(base, shot, quad, brightness=1.0, shadow=28):
    shot = ImageEnhance.Brightness(shot).enhance(brightness)
    shot = ImageEnhance.Contrast(shot).enhance(1.04)
    w, h = base.size
    sw, sh = shot.size
    coeffs = perspective_coeffs([(0, 0), (sw, 0), (sw, sh), (0, sh)], quad)
    warped = shot.transform((w, h), Image.PERSPECTIVE, coeffs, Image.Resampling.BICUBIC)
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).polygon(quad, fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(0.6))
    if shadow:
        shade = Image.new('RGBA', (w, h), (0, 0, 0, 0))
        ImageDraw.Draw(shade).polygon([(x + 10, y + 18) for x, y in quad], fill=(0, 0, 0, 150))
        shade = shade.filter(ImageFilter.GaussianBlur(shadow))
        base.alpha_composite(shade)
    plane = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    plane.paste(warped.convert('RGBA'), (0, 0))
    plane.putalpha(mask)
    base.alpha_composite(plane)


def cover_fit(im, size, anchor='center'):
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    left = 0 if anchor == 'left' else (resized.width - tw) // 2
    top = 0 if anchor == 'top' else (resized.height - th) // 2
    left = max(0, min(left, resized.width - tw))
    top = max(0, min(top, resized.height - th))
    return resized.crop((left, top, left + tw, top + th))


def save_master(im, path, kind='png'):
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = im.convert('RGB')
    if kind == 'jpg':
        rgb.save(path, 'JPEG', quality=90, optimize=True, progressive=True)
    else:
        rgb.save(path, 'PNG', optimize=True)
    print(path.relative_to(ROOT), rgb.size, path.stat().st_size // 1024, 'KB')
    return path


def paige():
    canvas = radial((2000, 1600), (38, 40, 44), (8, 9, 11), (1180, 620), 1.35).convert('RGBA')
    prd = load('assets/images/articles/paige-20261104/04_input_prd.png', 1400)
    bench = load('assets/images/articles/paige-20261104/03_new_paige_workbench.png', 1700)
    result = load('assets/images/articles/paige-20261104/05_result_strategy_exec_detail.png', 1600)
    place(canvas, prd, [(40, 150), (690, 70), (760, 1040), (-10, 1120)], 0.78, 22)
    place(canvas, bench, [(620, 30), (2140, 90), (2060, 900), (560, 790)], 1.0, 26)
    place(canvas, result, [(160, 860), (2140, 760), (2080, 1640), (80, 1560)], 0.92, 20)
    vignette = radial((2000, 1600), (255, 255, 255), (0, 0, 0), (1180, 640), 0.7).convert('L')
    edge = Image.new('RGBA', (2000, 1600), (0, 0, 0, 0))
    edge.putalpha(vignette.point(lambda p: 0 if p > 90 else int((90 - p) * 1.1)))
    canvas.alpha_composite(edge)
    return save_master(canvas, OUT / 'paige/covers/paige-cover-depth-v2.png')


def workshop():
    canvas = radial((1800, 1240), (244, 240, 232), (214, 208, 198), (860, 560), 1.2).convert('RGBA')
    library = load('assets/images/articles/resource-workshop/product-case-library.png', 1500)
    editor = load('assets/images/articles/resource-workshop/product-editor.png', 1200)
    place(canvas, editor, [(1040, 150), (1880, 90), (1860, 1120), (1080, 1160)], 0.96, 18)
    place(canvas, library, [(40, 70), (1240, 110), (1200, 1140), (20, 1100)], 1.0, 16)
    return save_master(canvas, OUT / 'resource-workshop/covers/workshop-cover-tools.png')


def onvideo():
    im = Image.open(ROOT / 'assets/images/projects/onvideo/21.jpg').convert('RGB')
    # The slide title sits above this rectangle; the crop is the editor itself.
    return save_master(cover_fit(im.crop((210, 168, 1195, 722)), (1600, 900)), OUT / 'onvideo/covers/onvideo-cover-editor.jpg', 'jpg')


def harness():
    im = Image.open(ROOT / 'assets/images/projects/harness/progress.jpg').convert('RGB')
    return save_master(cover_fit(im.crop((0, 50, im.width, im.height)), (1600, 900), 'left'), OUT / 'harness/covers/harness-cover-work.jpg', 'jpg')


def contact_sheet(pairs):
    font = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-microhei.ttc', 28)
    small = ImageFont.truetype('/usr/share/fonts/truetype/wqy/wqy-microhei.ttc', 18)
    cell_w, cell_h = 640, 420
    rows = []
    for name, before, after in pairs:
        row = Image.new('RGB', (cell_w * 2 + 36, cell_h + 54), (245, 243, 239))
        draw = ImageDraw.Draw(row)
        draw.text((8, 8), name, font=font, fill=(20, 17, 13))
        for i, (label, path) in enumerate((('之前', before), ('之后', after))):
            im = Image.open(path).convert('RGB')
            im.thumbnail((cell_w - 16, cell_h - 28))
            x = 8 + i * (cell_w + 16)
            y = 48 + (cell_h - 28 - im.height) // 2
            row.paste(im, (x, y))
            draw.text((x, 48 + cell_h - 24), label, font=small, fill=(80, 74, 68))
        rows.append(row)
    sheet = Image.new('RGB', (rows[0].width, sum(r.height + 16 for r in rows) + 16), (245, 243, 239))
    y = 16
    for row in rows:
        sheet.paste(row, (0, y))
        y += row.height + 16
    dest = ROOT / 'assets/images/projects/covers-contact-sheet.jpg'
    # The sheet is a review artifact, not a site image. Write it outside the deployed tree.
    dest = Path('/opt/cursor/artifacts/covers-before-after.jpg')
    dest.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(dest, 'JPEG', quality=86, optimize=True)
    print('sheet', dest, sheet.size)


def main():
    made = {
        'Paige': paige(),
        '资源位工坊': workshop(),
        'Onvideo': onvideo(),
        'Harness': harness(),
    }
    made.pop('云直播工作室', None)
    before = {
        'Paige': ROOT / 'assets/images/articles/paige-20261104/00_cover_5x4.jpg',
        '资源位工坊': ROOT / 'assets/images/articles/resource-workshop/product-case-library.png',
        'Onvideo': ROOT / 'assets/images/projects/onvideo-card.jpg',
        'Harness': ROOT / 'assets/images/projects/harness/entry.jpg',
        '云直播工作室': ROOT / 'assets/images/projects/videocloud/06.jpg',
    }
    contact_sheet([(name, before[name], path) for name, path in made.items()])


if __name__ == '__main__':
    main()
