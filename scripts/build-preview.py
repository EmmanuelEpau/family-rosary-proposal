from pathlib import Path
import re,json,shutil,html,hashlib
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
ROOT=Path(__file__).resolve().parents[1];T=ROOT/'wordpress/family-rosary';OUT=ROOT/'docs';OUT.mkdir(exist_ok=True)
if (OUT/'assets').exists():shutil.rmtree(OUT/'assets')
shutil.copytree(T/'assets',OUT/'assets')
ASSET_VERSION=hashlib.sha256(b''.join(p.read_bytes() for p in sorted(T.rglob('*')) if p.is_file())).hexdigest()[:10]
MANIFEST=json.loads((T/'assets/route-assets.json').read_text())
PHOTO_LAYOUTS=json.loads((T/'assets/photo-layouts.json').read_text())
for bundles in [MANIFEST['common'],*MANIFEST['routes'].values()]:
 for kind,extension in [('styles','css'),('scripts','js')]:
  assert all((T/'assets'/f'{name}.{extension}').exists() for name in bundles[kind])
routes={'prayer-by-age':('praying-with-children','Family Prayer by Age: Babies, Children & Teens | Family Rosary','Find a short prayer and a useful activity for babies, primary school children, preteens and teenagers. Follow a guided moment of family prayer together.'),'companion':('family-rosary-companion','Family Rosary Companion: Activities in English & Spanish | Family Rosary','Pray and color together with the Family Rosary Companion. Try an activity on this page and choose free English or Spanish mystery printables.'),'print-guide':('rosary-prayer-guide','Rosary Prayer Guide: Read or Print | Family Rosary','Read the Rosary prayers in English and all four sets of mysteries. Print a clear guide to keep beside you or share with your family.'),'home':('','Family Rosary | Pray Together as a Family','Find a welcoming place to learn the Rosary, pray together and discover resources for your family.'),'rosary-guide':('how-to-pray-the-rosary','How to Pray the Rosary, Step by Step | Family Rosary','Learn how to pray the Rosary, follow all five decades, read the prayers and mysteries, and find printable guides.'),'resources':('prayerresources','Family Prayer Resources & Rosary Guides | Family Rosary','Find Rosary guides, prayer book downloads and activities for children. Browse family prayer resources for home, school and parish.'),'story':('our-story','Our Story: Father Peyton and Family Prayer | Family Rosary','Discover Father Peyton’s invitation to family prayer and the worldwide mission of Family Rosary.'),'media':('watch-and-listen','Watch & Listen: Prayer, Podcasts and Reflections | Family Rosary','Watch daily prayer, explore reflections and listen to Family Rosary podcasts.')}
def convert(s,prefix,home=False):
 s=re.sub(r'<\?php\s*/\*\*.*?\*/\s*\?>','',s,flags=re.S)
 s=re.sub(r"<\?php echo esc_url\( get_theme_file_uri\( 'assets/(.*?)' \) \); \?>",lambda m:prefix+'assets/'+m.group(1),s)
 s=re.sub(r"<\?php echo esc_url\( home_url\( '(.*?)' \) \); \?>",lambda m:prefix+m.group(1).lstrip('/'),s)
 s=re.sub(r'<!-- wp:site-logo .*? /-->',lambda m:'<div class="wp-block-site-logo"><a href="'+prefix+'" rel="home"><img class="custom-logo" src="'+prefix+'assets/'+('logo-white.svg' if home else 'logo.svg')+'" width="176" height="73" alt="Family Rosary — home"></a></div>',s)
 def nav(m):
  attrs=json.loads(m.group(1));links=[]
  for a in re.findall(r'<!-- wp:navigation-link (.*?) /-->',m.group(2)):
   a=json.loads(a);u=a['url'];u=prefix+u.lstrip('/') if u.startswith('/') else u
   links.append('<li class="'+a.get('className','')+'"><a href="'+html.escape(u,quote=True)+'">'+html.escape(a['label'])+'</a></li>')
  cls=attrs.get('className','');return ('<button class="fr-mobile-toggle" aria-expanded="false" aria-controls="main-nav">Menu</button>' if cls=='fr-nav' else '')+'<nav '+('id="main-nav" ' if cls=='fr-nav' else '')+'class="'+cls+'" aria-label="'+attrs.get('ariaLabel','Navigation')+'"><ul>'+''.join(links)+'</ul></nav>'
 s=re.sub(r'<!-- wp:navigation (.*?) -->(.*?)<!-- /wp:navigation -->',nav,s,flags=re.S)
 s=re.sub(r'<!--.*?-->','',s,flags=re.S)
 # Same role sizes and derivatives as WordPress's render_block filter.
 def role_size(markup,roles,fallback):
  classes=re.search(r'\bclass="([^"]*)"',markup,re.I)
  return next((roles[c] for c in classes.group(1).split() if c in roles),fallback) if classes else fallback
 def photos(markup,figure_size):
  def photo(match):
   stem=match.group(2)
   if 'srcset=' in match.group(0) or not (T/'assets/photos'/f'{stem}-640.webp').exists():return match.group(0)
   base=match.group(1)[:-4]
   size='' if re.search(r'\bsizes="[^"]*"',match.group(0),re.I) else ' sizes="'+html.escape(role_size(match.group(0),PHOTO_LAYOUTS['images'],figure_size),quote=True)+'"'
   return match.group(0).replace('src="'+match.group(1)+'"','src="'+base+'-1280.webp" srcset="'+base+'-640.webp 640w, '+base+'-1280.webp 1280w"'+size)
  return re.sub(r'<img\b[^>]*\bsrc="([^" ]*/assets/photos/([^/" ]+)\.jpg)"[^>]*>',photo,markup,flags=re.I)
 s=re.sub(r'<figure\b[^>]*>.*?</figure>',lambda m:photos(m.group(0),role_size(m.group(0).split('>',1)[0],PHOTO_LAYOUTS['figures'],PHOTO_LAYOUTS['default'])),s,flags=re.I|re.S)
 s=photos(s,PHOTO_LAYOUTS['default'])
 # Keep internal review navigation on the current release even in previously open tabs.
 def review_link(m):
  target=html.unescape(m.group(2))
  if target.startswith(('./','../')):
   parts=urlsplit(target);query=dict(parse_qsl(parts.query,keep_blank_values=True));query['review']=ASSET_VERSION
   target=urlunsplit((parts.scheme,parts.netloc,parts.path,urlencode(query),parts.fragment))
  return '<a'+m.group(1)+'href="'+html.escape(target,quote=True)+'"'
 return re.sub(r'<a\b([^>]*?)href="([^"]+)"',review_link,s)
for slug,(path,title,desc) in routes.items():
 source=T/'patterns'/f'{slug}.php'
 if not source.exists():continue
 prefix='../' if path else './';dest=OUT/path;dest.mkdir(exist_ok=True)
 content=convert(source.read_text(),prefix);header=convert((T/'parts/header.html').read_text(),prefix,home=slug=='home');footer=convert((T/'parts/footer.html').read_text(),prefix)
 review='<div class="fr-proposal-note">Family Rosary website proposal · For design review · Not the live ministry website</div>'
 styles=''.join(f'<link rel="stylesheet" href="{prefix}assets/{name}.css?v={ASSET_VERSION}">' for name in dict.fromkeys(MANIFEST['common']['styles']+MANIFEST['routes'][slug]['styles']+['family-refinement']))
 scripts=''.join(f'<script defer src="{prefix}assets/{name}.js?v={ASSET_VERSION}"></script>' for name in dict.fromkeys(MANIFEST['common']['scripts']+MANIFEST['routes'][slug]['scripts']))
 if slug in ('home','media'):
  scripts='<script>window.frLivePrayer={scheduleURL:'+json.dumps(prefix+'live/prayer.json')+'};</script>'+scripts
 body_class=' class="home"' if slug=='home' else ''
 page=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc,quote=True)}"><link rel="icon" href="{prefix}assets/logo.svg">{styles}{scripts}</head><body{body_class} data-preview="true"><a href="#main-content" class="fr-skip">Skip to content</a>{header}<main id="main-content" class="fr-main">{content}</main>{footer}{review}</body></html>'''
 (dest/'index.html').write_text(page)
(OUT/'.nojekyll').touch();(OUT/'robots.txt').write_text('User-agent: *\nAllow: /\n# Every HTML page has noindex metadata. This is a public review proposal.\n')
(OUT/'404.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="robots" content="noindex"><title>Page not found | Family Rosary proposal</title></head><body><main><h1>This page isn’t part of the proposal.</h1><p>Use your browser’s Back button to return to the design, or <a href="/family-rosary-proposal/">open the homepage</a>.</p></main></body></html>')
print('Static review exported from WordPress patterns and template parts.')

# Package the current native theme alongside the static review.
(OUT/"downloads").mkdir(exist_ok=True)


# Priority program pages share the same generated review shell and asset revision.
program_builder=ROOT/'scripts/build-programs.py'
if program_builder.exists():
 exec(compile(program_builder.read_text(),str(program_builder),'exec'),globals())

shutil.make_archive(str(OUT/"downloads/family-rosary-theme-1.8.1"),"zip",root_dir=T.parent,base_dir=T.name)
