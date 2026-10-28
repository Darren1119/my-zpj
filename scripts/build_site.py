#!/usr/bin/env python3
"""Embed critical scripts so a second network failure cannot disable project entry.

The source files remain editable. Run after changing one, or use --check in CI.
"""
import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
page = ROOT / 'index.html'
original = page.read_text()
result = original
for name in ('media-manifest', 'portfolio-media', 'portfolio-controls'):
    src = f'assets/{name}.js'
    script = (ROOT / src).read_text().rstrip()
    assert '</script' not in script.lower(), f'Unsafe script terminator: {src}'
    pattern = rf'<script (?:src="{re.escape(src)}"></script>|data-source="{re.escape(src)}">.*?</script>)'
    result, count = re.subn(pattern, lambda _: f'<script data-source="{src}">\n{script}\n</script>', result, flags=re.S)
    assert count == 1, f'Expected one source slot: {src}, got {count}'
if args.check:
    assert result == original, 'Embedded scripts are stale; run python3 scripts/build_site.py'
    print('PASS: critical scripts match their source files.')
else:
    page.write_text(result)
    print('Embedded critical scripts into index.html.')
