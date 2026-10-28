#!/usr/bin/env python3
"""Static release checks for the no-build portfolio. Run: python3 scripts/check_site.py."""
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / 'index.html').read_text()

class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.scripts = []
        self.in_script = False
    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag == 'script':
            self.in_script = True
            self.scripts.append('')
    def handle_endtag(self, tag):
        if tag == 'script': self.in_script = False
    def handle_data(self, text):
        if self.in_script: self.scripts[-1] += text

page = Page()
page.feed(html)
ids = [attrs['id'] for _, attrs in page.tags if 'id' in attrs]
assert len(ids) == len(set(ids)), 'Duplicate static element IDs'
assert sum(tag == 'main' for tag, _ in page.tags) == 1, 'Exactly one main landmark required'
assert any(a.get('id') == 'page-home' and 'active' in a.get('class', '').split() for _, a in page.tags), 'Home must be visible before scripts run'
assert sum(tag == 'dialog' for tag, _ in page.tags) == 4, 'Preview, album, illustration and copy dialogs required'
for tag, attrs in page.tags:
    if tag == 'img' and attrs.get('src', '').startswith('assets/'):
        assert attrs.get('width') and attrs.get('height'), f'Image dimensions missing: {attrs["src"]}'
        assert (ROOT / attrs['src']).is_file(), attrs['src']
        assert '/optimized/' in attrs['src'] or attrs['src'].endswith('.svg'), f'Unoptimized static image: {attrs["src"]}'
    if tag == 'script' and attrs.get('src'):
        assert (ROOT / attrs['src']).is_file(), attrs['src']
for script in page.scripts:
    if script.strip(): subprocess.run(['node', '--check'], input=script, text=True, check=True)
for script in ROOT.glob('assets/portfolio-*.js'):
    subprocess.run(['node', '--check', str(script)], check=True)

manifest_source = (ROOT / 'assets/media-manifest.js').read_text()
manifest = json.loads(manifest_source.split('window.portfolioMedia = ', 1)[1].rstrip(';\n'))
for path, media in manifest.items():
    assert (ROOT / path).is_file(), f'Original missing: {path}'
    assert media['width'] > 0 and media['height'] > 0, path
    assert (ROOT / media['src']).is_file(), path
    for variant in media.get('variants', []):
        assert (ROOT / variant['src']).is_file(), variant['src']
assert len(html.encode()) < 1024 * 1024, 'HTML exceeds the 1 MiB source-size guardrail'
print(f'PASS: script syntax, landmarks, unique IDs, image dimensions, {len(manifest)} originals and derivative references.')
