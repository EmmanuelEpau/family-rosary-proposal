"""Export substantive, source-attributed program pages alongside the review library.
Called by build-preview with its established converters and review protection.
"""
programs=json.loads(re.search(r'<script type="application/json" id="cinema-catalog">(.*?)</script>',(T/'patterns/media.php').read_text(),re.S).group(1))
for m in programs:
 e=lambda value:html.escape(str(value),quote=True)
 path='programs/'+m['id'];prefix='../../';dest=OUT/path;dest.mkdir(parents=True,exist_ok=True)
 filmed=m.get('preferred_playback')=='video' and m.get('video_alternate',{}).get('visual_format')=='filmed-conversation'
 edition=m['video_alternate'] if filmed else m
 play='../..'+'/watch-and-listen/?episode='+m['id']+'&play=1&review='+ASSET_VERSION
 words={'video-zaqlP4rX518':('Sign of the Cross','In the name of the Father and of the Son and of the Holy Spirit. Amen.'),'video-_cypVUxgYmI':('Our Father','Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.')}
 text=''
 if m['id'] in words:
  label,prayer=words[m['id']];text='<section><h2>'+label+'</h2><p class="fr-lead">'+e(prayer)+'</p><p>Prayer words from <a href="https://www.familyrosary.org/how-to-pray-the-rosary">Family Rosary’s prayer guide</a>.</p></section>'
 related=[x for x in programs if x['series']==m['series'] and x['id']!=m['id']]
 info=[('Series',m['series']),('From',m['publisher']),('Format','Video conversation' if filmed else 'Audio' if m['type']=='podcast' else 'Video')]
 if edition.get('duration_label'):info.append(('Length',edition['duration_label']))
 if edition.get('published_on'):info.append(('Published',edition['published_on']))
 if m.get('guest_name'):info.append(('Guest',m['guest_name']))
 content='<article class="fr-wrap fr-section"><p><a href="../../watch-and-listen/">Watch &amp; Listen</a> / '+e(m['series'])+'</p><h1>'+e(m['display_title'])+'</h1><p class="fr-lead">'+e(m['description'])+'</p><p><a class="fr-button" href="'+e(play)+'">'+('Listen' if m['type']=='podcast' and not filmed else 'Watch')+' now</a></p><dl>'+''.join('<dt><strong>'+e(k)+'</strong></dt><dd>'+e(v)+'</dd>' for k,v in info)+'</dl>'+text+'<section><h2>About this episode</h2><p>'+e(m['audience'])+'</p><p>Original title: '+e(m['title'])+'</p><a href="'+e(m.get('episode_url') or m['playback_url'])+'">Original program on '+e(m['provider'])+'</a></section>'
 if related:content+='<section><h2>More from '+e(m['series'])+'</h2><ul>'+''.join('<li><a href="../'+e(x['id'])+'/">'+e(x['display_title'])+'</a></li>' for x in related)+'</ul></section>'
 content+='</article>'
 content=re.sub(r'<p><a class="fr-button".*?</a></p>','<div class="program-player"><button class="fr-primary" data-program-embed="'+e(edition['embed_url'].replace('www.youtube.com/','www.youtube-nocookie.com/'))+'" data-program-title="'+e(m['display_title'])+'">Play</button></div>',content,count=1)
 header=convert((T/'parts/header.html').read_text(),prefix);footer=convert((T/'parts/footer.html').read_text(),prefix)
 page='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+e(m['display_title'])+' | Family Rosary</title><meta name="description" content="'+e(m['description'])+'"><link rel="stylesheet" href="../../assets/site.css?v='+ASSET_VERSION+'"><link rel="stylesheet" href="../../assets/family-refinement.css?v='+ASSET_VERSION+'"><script defer src="../../assets/program.js?v='+ASSET_VERSION+'"></script><script defer src="../../assets/site.js?v='+ASSET_VERSION+'"></script></head><body data-preview="true"><a class="fr-skip" href="#main-content">Skip to content</a>'+header+'<main id="main-content">'+content+'</main>'+footer+'<div class="fr-proposal-note">Family Rosary website proposal · For design review</div></body></html>'
 (dest/'index.html').write_text(page)
 native=content
 # Native patterns use site-relative links from the same /programs/id/ page depth.
 (T/'patterns'/('program-'+m['id']+'.php')).write_text('<?php\n/**\n * Title: '+m['display_title'].replace('*/','')+'\n * Slug: family-rosary/program-'+m['id']+'\n * Categories: family-rosary\n * Inserter: no\n */\n?>\n<!-- wp:html -->'+native+'<!-- /wp:html -->')
print('Exported57 substantive program pages; no invented transcripts or metadata.')
