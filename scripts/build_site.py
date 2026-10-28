#!/usr/bin/env python3
"""Embed critical scripts so a second network failure cannot disable project entry.

The source files remain editable. Run after changing one, or use --check in CI.
"""
import argparse
import json
import re
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
args = parser.parse_args()
page = ROOT / 'index.html'
original = page.read_text()
result = original
class Covers(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = {}
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'fd-card' in a.get('class', '').split() and a.get('data-id') and a.get('data-img'):
            self.items.setdefault(a['data-id'], a['data-img'])

covers = Covers()
covers.feed(original)
manifest = json.loads((ROOT / 'assets/media-manifest.js').read_text().split('window.portfolioMedia = ', 1)[1].rstrip(';\n'))
preloads = {}
for project, src in covers.items.items():
    media = manifest.get(src)
    if media:
        preloads[project] = {'src': media['src'], 'srcset': ', '.join(f'{v["src"]} {v["width"]}w' for v in media.get('variants', []))}
preload_script = '''(() => {
  if (!location.hash.startsWith('#project/')) return;
  const covers = %s;
  const cover = covers[location.hash.replace(/^#project\\//, '')];
  if (!cover) return;
  const link = document.createElement('link');
  link.rel = 'preload'; link.as = 'image'; link.href = cover.src;
  if (cover.srcset) { link.imageSrcset = cover.srcset; link.imageSizes = '(max-width:760px) 94vw, 960px'; }
  link.fetchPriority = 'high'; document.head.append(link);
})();''' % json.dumps(preloads, ensure_ascii=False, separators=(',', ':'))
result, count = re.subn(r'<script data-source="route-preload">.*?</script>', lambda _: '<script data-source="route-preload">\n' + preload_script + '\n</script>', result, flags=re.S)
assert count == 1, 'Expected one route preload slot'
css = (ROOT / 'assets/portfolio-refinements.css').read_text().rstrip()
assert '</style' not in css.lower()
result, count = re.subn(r'<link rel="stylesheet" href="assets/portfolio-refinements.css">|<style data-source="assets/portfolio-refinements.css">.*?</style>', lambda _: '<style data-source="assets/portfolio-refinements.css">\n' + css + '\n</style>', result, flags=re.S)
assert count == 1, 'Expected one critical stylesheet slot'
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
