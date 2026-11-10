from pathlib import Path
import ast,html,hashlib,json,re
from urllib.parse import urlsplit,urlunsplit,parse_qsl,urlencode
ROOT=Path(__file__).resolve().parents[1];T=ROOT/'wordpress/family-rosary';PHOTO_LAYOUTS=json.loads((T/'assets/photo-layouts.json').read_text());ASSET_VERSION='test'
source=(ROOT/'scripts/build-preview.py').read_text();tree=ast.parse(source)
convert=next(n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='convert');exec(compile(ast.Module(body=[convert],type_ignores=[]),str(ROOT/'scripts/build-preview.py'),'exec'))
stem='family-daughters-prayer';photo='./assets/photos/'+stem+'.jpg';img='<img src="'+photo+'" alt="family">'
for cls,size in PHOTO_LAYOUTS['figures'].items():
 result=convert('<figure class="wp-block-image '+cls+'">'+img+'</figure>','./')
 assert f'sizes="{html.escape(size,quote=True)}"' in result,(cls,result)
 assert result.count('srcset=')==1
 assert convert(result,'./')==result,'Repeated render must preserve existing responsive metadata'
# Same photograph can be a full-bleed hero, narrow card, or tiny selector.
selector=convert('<figure class="fr-family-slide"><img src="'+photo+'" sizes="48px"></figure>','./');assert 'sizes="48px"' in selector and selector.count('sizes=')==1
fallback=convert('<img class="fr-rosary-fallback" src="'+photo+'">','./');assert PHOTO_LAYOUTS['images']['fr-rosary-fallback'] in fallback
pending='<figure class="fr-family-slide"><img data-family-source="'+photo+'" data-family-srcset="pending" sizes="100vw"></figure>';assert convert(pending,'./')==pending,'Deferred hero cannot become eager'
php=(T/'functions.php').read_text();assert "assets/photo-layouts.json" in php and "$layouts['figures']" in php and "$layouts['images']" in php
assert "preg_match( '~\\bsizes=" in php,'Native filter must preserve explicit sizes'
cinema=(ROOT/'scripts/build-cinema.py').read_text();assert 'sizes="100vw"' in cinema and 'sizes="(max-width: 780px) 78vw' in cinema and '1024px" src=' in cinema
print('Role-size conversion passed for all figure roles, explicit overrides, shared native configuration, idempotence and deferred hero preservation. Native PHP runtime execution remains the WordPress validation gate.')
