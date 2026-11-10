"""Check the exported review's page substance and local navigation, without a browser."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / 'docs'
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.h1 = 0; self.title = ''; self.in_title = False; self.description = ''; self.robots = ''; self.links = []; self.ids = set(); self.feed(source)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'h1': self.h1 += 1
        if tag == 'title': self.in_title = True
        if a.get('id'): self.ids.add(a['id'])
        if tag == 'meta' and a.get('name') == 'description': self.description = a.get('content', '')
        if tag == 'meta' and a.get('name') == 'robots': self.robots = a.get('content', '')
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
    def handle_endtag(self, tag):
        if tag == 'title': self.in_title = False
    def handle_data(self, text):
        if self.in_title: self.title += text
pages = {p: Page(p.read_text()) for p in DOCS.rglob('index.html')}
assert len(pages) == 65, len(pages)
assert len({p.title for p in pages.values()}) == len(pages), 'Page titles must be unique'
assert len({p.description for p in pages.values()}) == len(pages), 'Descriptions must be unique'
errors = []
for path, page in pages.items():
    assert page.h1 == 1 and page.title.strip() and page.description.strip(), path
    assert 'noindex' in page.robots, path
    for href in page.links:
        u = urlsplit(href)
        if u.scheme or u.netloc or not u.path: continue
        target = (DOCS / u.path.lstrip('/')) if u.path.startswith('/') else path.parent / unquote(u.path)
        target = target.resolve()
        if target.is_dir(): target /= 'index.html'
        if not target.exists(): errors.append((str(path.relative_to(DOCS)), href))
assert not errors, errors
print(f'{len(pages)} pages: unique titles/descriptions, one H1, review noindex and all local link destinations verified.')
