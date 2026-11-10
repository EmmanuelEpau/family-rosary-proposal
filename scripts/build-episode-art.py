"""Build editable native SVG textures for title-led audio compositions.
No participant imagery is generated. Exact episode titles remain native HTML.
"""
from pathlib import Path
import json, html
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'wordpress/family-rosary/assets/episodes'
OUT.mkdir(exist_ok=True)
media=json.loads((ROOT/'content/media.json').read_text())
for i,m in enumerate(x for x in media if x['series']=='Through the Mysteries'):
    # A real magnifying-glass silhouette, retaining the original series motif.
    cx=1190+(i%4)*45+(i//20)*25;cy=260+(i%5)*75
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img"><title>{html.escape(m['title'])} — editorial audio artwork</title><desc>Family Rosary blue textured field with a magnifying glass. Native page text supplies the series and exact episode title. No guest or session photograph is implied.</desc><g fill="none" stroke="#FFB500" stroke-width="32" opacity=".8"><circle cx="{cx}" cy="{cy}" r="183"/><path stroke-width="78" d="M{cx+129} {cy+129}l190 190"/></g><circle cx="{cx}" cy="{cy}" r="148" fill="#fff" opacity=".055"/><path d="M96 792h160" stroke="#FFB500" stroke-width="8"/></svg>'''
    (OUT/(m['id']+'.svg')).write_text(svg+'\n')
print('Built 23 native episode backgrounds; exact titles remain editable HTML.')
