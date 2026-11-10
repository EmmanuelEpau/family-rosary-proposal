#!/usr/bin/env python3
"""Build the crawlable resource directory; no network requests. Run from any directory."""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
e = lambda value: html.escape(str(value), quote=True)
source = json.loads((ROOT / 'content/resource-previews.json').read_text())
curated = json.loads((ROOT / 'content/resources.json').read_text())
formats = ('download activity-collection download-collection podcast podcast event event event livestream video download novena video video video video ebook guide ebook image-reflection ebook ebook image-reflection image-reflection image-reflection image-reflection image-reflection ebook ebook article article ebook ebook ebook ebook article article video podcast infographic ebook ebook ebook ebook activity activity activity podcast').split()
topics = ['rosary children family','children family mass','creation family','prayer','family parenting','marriage parish','prayer fellowship','prayer rosary','rosary mass','rosary','rosary novena peyton','rosary novena peyton','rosary','faith rosary','sacred-art','prayer homily','rosary beginners peyton','rosary beginners','rosary beginners','rosary glorious sacred-art peyton','rosary joyful scripture','rosary beginners','rosary sorrowful sacred-art','rosary joyful sacred-art','rosary joyful sacred-art peyton','rosary glorious sacred-art peyton','rosary luminous sacred-art','rosary glorious scripture','mary activity','mary rosary','children family','prayer family','family prayer','children family','family prayer','mary','family rosary','peyton cross','rosary peyton family','mary chaplet','mary rosary sacred-art','lent cross sacred-art','christmas sacred-art family','christmas sacred-art','advent christmas children family','advent christmas children family','lent children family','christmas']
labels = {'download':'Download','activity-collection':'Activity collection','download-collection':'Download collection','podcast':'Podcast','event':'Event / retreat','livestream':'Livestream','video':'Video','ebook':'eBook','guide':'Guide','novena':'Novena','image-reflection':'Image reflection','article':'Article','infographic':'Infographic','activity':'Printable activity','pdf':'PDF'}
actions = {'download':'Explore download','activity-collection':'Explore activities','download-collection':'Explore collection','podcast':'Listen to podcast','event':'View current dates and details','livestream':'Join daily prayer','video':'Watch videos','ebook':'Explore eBook','guide':'Read the guide','novena':'Explore novena','image-reflection':'Open reflection','article':'Read article','infographic':'Explore infographic','activity':'Explore activity','pdf':'Open PDF'}
old_ids = ['resource-0','resource-companion','resource-2','resource-3','resource-4','resource-5','resource-6','resource-7','resource-mass-activities','resource-growing','resource-children','resource-creation']
merged = {0:1,1:8,2:11,30:10,33:9}
records=[]
for i,item in enumerate(source):
    fmt=formats[i]
    records.append(dict(item, id=old_ids[merged[i]] if i in merged else 'resource-'+item['url'].rsplit('/',1)[-1], sourceIndex=i, format=fmt, topics=topics[i], languages=['en','es'] if i==0 else ['es'] if i in (11,45) else [], section='events' if fmt=='event' else 'articles' if fmt=='article' else 'library', action=actions[fmt]))
# Preserve six distinct curated destinations; original source titles are never replaced.
for i in (0,2,3,4,5,6):
    title,fmt,topic,language,description,url,action=curated[i]
    fmt='pdf' if i in (3,4) else 'guide' if i==0 else 'article'
    records.append(dict(title=title,description=description,url=url,image='',id=old_ids[i],format=fmt,topics=topic,languages=['es'] if i==4 else ['en','es','pt'] if i==0 else ['en'],section='articles' if fmt=='article' else 'library',action=action))
# Optional verified destination inventory, keyed by original URL. Explicit actions override format defaults.
resolved=ROOT/'content/resource-destinations.json'
if resolved.exists():
    destinations=json.loads(resolved.read_text())
    for record in records:
        change=destinations.get(record['url'],{})
        for key in ('url','languages','format','description','section','source_url','source_label'):
            if key in change: record[key]=change[key]
        if 'format' in change: record['action']=actions.get(record['format'],'Explore resource')
        if 'action' in change: record['action']=change['action']
# Root's saved destination headings and source descriptions establish these English articles.
# This evidence applies to HTML articles, not the language inside linked PDFs or media.
confirmed_english_articles = {19, 22, 23, 24, 25, 26, 29, 30, 35, 36}
for record in records:
    if record.get('sourceIndex') in confirmed_english_articles and record['format'] == 'article' and not record['languages']:
        record['languages'] = ['en']
assert len(source)==48 and len(records)==54
assert len({r['id'] for r in records})==54
assert all(any(r.get('sourceIndex')==i for r in records) for i in range(48))
parts=['''<?php
/**
 * Title: Prayer resources — complete directory
 * Slug: family-rosary/resources
 * Categories: family-rosary
 * Inserter: yes
 */
?>
<!-- wp:html -->
<div class="rd-page">
<section class="fr-wrap fr-section rd-intro"><p><a href="../">Home</a> / Resources</p><h1>Resources for family prayer.</h1><p class="fr-lead">A guide beside you. An activity to share. A little room for prayer.</p><p>Explore Rosary guides, family activities, reflections, podcasts and ministry programs for home, school and parish.</p>
<div class="rd-start"><h2>Find a place to begin.</h2><div class="rd-shortcuts"><a href="#resource-companion">Discover the Rosary together <span>Family Rosary Companion · English & Español</span></a><a href="#resource-mass-activities">Bring out the crayons <span>Family Mass Activities · print and share</span></a><a href="?topic=children#resource-library">Pray with children <span>Activities and ideas for family prayer</span></a></div></div></section>
<section class="fr-wrap fr-section" id="resource-library"><span id="resource-7"></span><h2>Browse family prayer resources</h2><p>Choose a topic or format, or search for something your family needs. Articles, media and events are labeled so you know what comes next.</p>
<form id="rd-filters" class="rd-filters" hidden role="search"><label class="rd-search">Search resources<input id="rd-search" name="q" type="search" placeholder="Try Rosary, children or sacred art"></label>''']
def select(key,label,options):
    return '<label>'+label+'<select id="rd-'+key+'" name="'+key+'"><option value="">All '+('languages' if key == 'language' else label.lower())+'</option>'+''.join('<option value="'+e(k)+'">'+e(v)+'</option>' for k,v in options)+'</select></label>'
parts.append(select('view','Sections',[('library','Prayer, activities & media'),('articles','Articles'),('events','Events & retreats')]))
parts.append(select('topic','Topics',[(k,v) for k,v in [('rosary','Rosary'),('family','Family prayer'),('children','Children'),('beginners','Getting started'),('mary','Mary'),('sacred-art','Sacred art'),('scripture','Scripture'),('advent','Advent'),('christmas','Christmas'),('lent','Lent'),('peyton','Father Peyton'),('creation','Care for creation'),('marriage','Marriage'),('mass','Mass')]]))
parts.append(select('format','Formats',sorted({(r['format'],labels[r['format']]) for r in records},key=lambda x:x[1])))
parts.append(select('language','Confirmed language',[('en','English'),('es','Español'),('pt','Português'),('unknown','Language not confirmed')]))
parts.append('''<button type="reset" class="rd-reset">Clear filters</button></form><p class="rd-language-note">Language labels reflect confirmed resource information. Choose “Language not confirmed” to include resources whose language we have not established.</p><p id="rd-count" role="status" aria-live="polite">54 resources: 48 from the ministry collection and 6 additional guides and reflections.</p><p id="rd-notice" hidden></p><div class="rd-results">''')
for r in records:
    languages=' · '.join({'en':'English','es':'Español','pt':'Português'}[x] for x in r['languages'])
    meta=labels[r['format']]+(' · '+languages if languages else '')
    desc=r['description'] or {'podcast':'Conversations about prayer in everyday life.','video':'Explore this ministry video collection.','livestream':'Join the ministry’s daily Rosary and Mass.'}.get(r['format'],'Explore this resource from Family Rosary.')
    parts.append('<article tabindex="-1" class="rd-resource fr-resource-gallery-card" id="'+e(r['id'])+'" data-topics="'+e(r['topics'])+'" data-format="'+e(r['format'])+'" data-language="'+e(' '.join(r['languages']) or 'unknown')+'" data-view="'+r['section']+'">')
    if r['image']:parts.append('<a class="rd-art" href="'+e(r['url'])+'" tabindex="-1" aria-hidden="true"><img src="'+e(r['image'])+'" alt="" loading="lazy" width="480" height="480"></a>')
    parts.append('<div class="rd-copy"><p class="rd-meta">'+e(meta)+'</p><h3><a href="'+e(r['url'])+'">'+e(r['title'])+'</a></h3><p>'+e(desc)+'</p>')
    if r.get('source_url'):
        parts.append('<p><a class="rd-source" href="'+e(r['source_url'])+'">'+e(r.get('source_label','Original resource'))+'</a></p>')
    parts.append('<a class="rd-action" href="'+e(r['url'])+'">'+e(r['action'])+'</a></div></article>')
parts.append('''</div><div id="rd-empty" hidden><h3>No matching resources.</h3><p>Try a shorter search or clear your filters to browse the collection.</p><button type="button" id="rd-empty-reset">Clear filters</button></div><button type="button" id="rd-more" hidden>Show more resources</button></section>
<section id="family-prayer-by-age" class="fr-wrap fr-section rd-questions"><h2>One small way to pray together.</h2><div class="rd-age"><div><h3>Babies & preschoolers</h3><p>Hold your baby, or sit beside your child. Name someone you love and offer a little prayer of thanks. Listening is a way to take part.</p></div><div><h3>Primary school</h3><p>Invite a child to name an intention, lead a familiar response or follow the prayer words. Begin with one complete prayer:</p><p>Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.</p></div><div><h3>Preteens</h3><p>Anyone may offer an intention, or keep it quietly. Choose a familiar prayer together and make room for questions.</p></div><div><h3>Teenagers</h3><p>Let each person choose an intention or a prayer to lead. Quiet listening is welcome; sharing aloud is optional.</p></div></div>
<h2>A little help finding your way.</h2><details><summary>Where can I find prayer resources for children?</summary><p>Explore <a href="#resource-children">Praying with Children</a>, <a href="#resource-mass-activities">Family Mass Activities</a> and <a href="#resource-growing">Navigating Prayer Time as Children Grow</a>.</p></details><details><summary>Can I read or print the Rosary prayers?</summary><p>Read the prayers and all four sets of mysteries in our <a href="../rosary-prayer-guide/">Rosary prayer guide</a>, or print a copy to keep beside you.</p></details><details><summary>Are there guides in other languages?</summary><p>The <a href="../how-to-pray-the-rosary/">how-to guide</a> links to prayer guides in English, Español and Português. These are resource languages; the surrounding website is in English.</p></details><details><summary>Where can I find current ministry events?</summary><p>Choose Events & retreats in the directory to explore Marriage Illuminated Training, Brothers of the Carpenter and The Art of Prayer. Follow each program’s link for current dates and details.</p></details></section>
<section class="fr-wrap fr-section"><h2>Someone to pray with you.</h2><p>Ask for prayer, or offer a moment for another person’s intention, through our prayer community.</p><a class="rd-action" href="https://www.worldatprayer.org/">Visit A World at Prayer</a></section></div>
<!-- /wp:html -->
''')
def internal_href(match):
    url = html.unescape(match.group(1))
    if not url.startswith(('/', '../', './')) or url.startswith('//'):
        return match.group(0)
    while url.startswith(('../', './')):
        url = url.split('/', 1)[1]
    path = '/' + url.lstrip('/')
    path = path.replace("\\", "\\\\").replace("'", "\\'")
    return 'href="<?php echo esc_url( home_url( \'%s\' ) ); ?>"' % path

pattern = re.sub(r'href="([^"]+)"', internal_href, '\n'.join(parts))
assert not re.search(r'href="(?:/(?!/)|\.\.?/)', pattern), 'Internal links must use home_url'
(ROOT/'wordpress/family-rosary/patterns/resources.php').write_text(pattern)
print('Generated 54 resource cards; all 48 source identities and all 12 legacy anchors preserved.')
