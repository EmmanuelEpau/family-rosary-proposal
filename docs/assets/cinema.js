/* Family Rosary's film and audio discovery. Catalog text remains in the document. */
(() => {
 'use strict';
 const root=document.querySelector('.fr-cinema');if(!root)return;
 const $=s=>root.querySelector(s),catalog=JSON.parse($('#cinema-catalog').textContent),byId=new Map(catalog.map(m=>[m.id,m]));
 const base=root.dataset.cinemaBase,dialog=$('#cinema-dialog'),mount=$('#cinema-player-mount'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let current=null,trigger=null,activeAudio=null,audioWidget=null,widgetPromise=null,closingForAudio=false,audioReadyTimer=0,audioStartTimer=0,audioReady=false;
 const dock=document.createElement('section');dock.className='cinema-audio-dock';dock.hidden=true;dock.setAttribute('aria-label','Audio player');
 dock.innerHTML='<div class="cinema-dock-heading"><strong class="cinema-dock-title"></strong><div><button type="button" class="cinema-dock-toggle" disabled></button><button type="button" class="cinema-dock-minimize" aria-expanded="true"></button><button type="button" class="cinema-dock-details"></button><button type="button" class="cinema-dock-stop"></button></div></div><p class="cinema-dock-status fr-sr-only" role="status"></p><div class="cinema-dock-provider"></div>';
 root.append(dock);const dockProvider=dock.querySelector('.cinema-dock-provider'),dockToggle=dock.querySelector('.cinema-dock-toggle'),dockStatus=dock.querySelector('.cinema-dock-status');
 function dockIcon(button,kind,label){
  const paths={play:'<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',collapse:'<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',details:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none"/>'};
  button.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false">'+paths[kind]+'</svg>';button.setAttribute('aria-label',label);button.title=label;
 }
 dockIcon(dockToggle,'play','Play audio');dockIcon(dock.querySelector('.cinema-dock-minimize'),'collapse','Minimize audio controls');dockIcon(dock.querySelector('.cinema-dock-stop'),'stop','Stop audio');dockIcon(dock.querySelector('.cinema-dock-details'),'details','Episode details and other episodes');
 dock.querySelector('.cinema-dock-details').addEventListener('click',()=>{if(activeAudio)open(activeAudio,dock.querySelector('.cinema-dock-details'),false);});
 function stopAudio(){audioReady=false;clearTimeout(audioReadyTimer);clearTimeout(audioStartTimer);dock.classList.remove('needs-recovery');if(audioWidget){['READY','PLAY','PAUSE','FINISH'].forEach(name=>audioWidget.unbind('PB.Widget.Events.'+name));}audioWidget=null;activeAudio=null;const frame=dockProvider.querySelector('iframe');if(frame)frame.src='about:blank';dockProvider.replaceChildren();dock.hidden=true;dockToggle.disabled=true;document.body.classList.remove('has-cinema-audio');}
 function widgetAPI(){
  if(typeof window.PB==='function')return Promise.resolve(window.PB);
  if(!widgetPromise)widgetPromise=new Promise((resolve,reject)=>{const script=document.createElement('script'),fail=()=>{clearTimeout(deadline);script.remove();reject(new Error('Widget unavailable'));},deadline=setTimeout(fail,8000);script.src='https://pbcdn1.podbean.com/fs1/player/api.js';script.onload=()=>{if(typeof window.PB!=='function'){fail();return;}clearTimeout(deadline);resolve(window.PB);};script.onerror=fail;document.head.append(script);}).catch(error=>{widgetPromise=null;throw error;});
  return widgetPromise;
 }
 dock.querySelector('.cinema-dock-stop').addEventListener('click',()=>{stopAudio();if(trigger?.isConnected&&trigger.getClientRects().length)trigger.focus();else $('#cinema-search').focus();});
 function setDockCompact(compact){dock.classList.toggle('is-minimized',compact);const button=dock.querySelector('.cinema-dock-minimize');button.setAttribute('aria-expanded',String(!compact));dockIcon(button,compact?'expand':'collapse',compact?'Show audio controls':'Minimize audio controls');}
 dock.querySelector('.cinema-dock-minimize').addEventListener('click',()=>setDockCompact(!dock.classList.contains('is-minimized')));
 dockToggle.addEventListener('click',()=>{if(audioWidget&&audioReady)audioWidget.toggle();else if(activeAudio){const episode=activeAudio;stopAudio();loadAudio(episode);}});
 // Editorial selections, not recommendations inferred from a visitor's history.
 const familyPicks=['video-9IsIPuJNdHI','video-3Hpny2VtT9U','video-8hAd27w4zP0','audio-64hj4-196a89f-pb','audio-fyfm3-17e85d9-pb','video-bEhFuQAS9Wk'];
 const prayerPicks=['video-XkE8fuk1rHs','audio-w2jp2-1978007-pb','audio-nxyph-1896d37-pb','video-OEjIKD6McsY','audio-fyfm3-17e85d9-pb','video-28fq8R_KELY'];
 const parentPicks=['video-DJt4qhivoKY','video-vmeHCwsrnvw','video-vxtnUvuu1aU','video-bEhFuQAS9Wk','video-28fq8R_KELY','audio-fyfm3-17e85d9-pb'];
 const relatedBySeries={
  'Staying Together: Families Praying Together':familyPicks,
  'Family Prayer':parentPicks,
  'Digital Age Family Safety':parentPicks,
  'Through the Mysteries':prayerPicks,
  "How's Your Prayer Life?":familyPicks,
  'Daily Reflection Videos':familyPicks,
  'How to Pray the Rosary':prayerPicks,
  'Daily Rosary and Mass':prayerPicks
 };
 const el=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
 const photoArt=new Set(["photos/child-rosary-costume.jpg", "photos/costume-children.jpg", "photos/crucifix-peyton-center.jpg", "photos/family-children-prayer.jpg", "photos/family-daughters-prayer.jpg", "photos/family-festival-joy.jpg", "photos/family-relic-welcome.jpg", "photos/marian-2026.jpg", "photos/mary-may-crowning.jpg", "photos/mass-bernadette-2026.jpg", "photos/mother-children-relic.jpg"]);
 function setArtImage(img,path,sizes){
  if(photoArt.has(path)){const stem=base+path.slice(0,-4);img.sizes=sizes;img.srcset=stem+'-640.webp 640w, '+stem+'-1280.webp 1280w';img.src=stem+'-1280.webp';}
  else{img.removeAttribute('srcset');img.removeAttribute('sizes');img.src=/^https:\/\/i\.ytimg\.com\/vi\/[\w-]{11}\/mqdefault\.jpg$/.test(path)?path:base+path;}
 }
 const filmed=m=>m.preferred_playback==='video'&&m.video_alternate?.visual_format==='filmed-conversation';
 const videoSource=m=>({...m.video_alternate,title:m.series+' — '+(m.guest_name||m.title),playback_url:m.video_alternate.url,type:'video'});
 function sessionWordmark(){const mark=el('span',null,'session-wordmark');mark.setAttribute('aria-hidden','true');mark.append(el('span','How’s Your'),el('i','Prayer Life?'));return mark;}
 function sessionComposition(m){const fragment=document.createDocumentFragment(),pair=el('span',null,'session-speakers'+(m.session_cutout_mask?' session-cutout':''));pair.setAttribute('aria-hidden','true');if(m.session_cutout_mask)pair.style.setProperty('--session-cutout-mask','url("'+new URL(base+m.session_cutout_mask,document.baseURI).href+'")');['guest','host'].forEach(person=>{const window=el('span',null,'session-person session-person-'+person),image=el('img');image.src=base+m.artwork;image.alt='';image.loading='lazy';window.append(image);pair.append(window);});fragment.append(sessionWordmark(),pair);return fragment;}
 function mysteryWordmark(){const mark=el('span',null,'episode-show');mark.innerHTML='Through the <i>Mysteries</i><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="9" cy="9" r="6"/><path d="m14 14 7 7"/></svg>';return mark;}
 function guestComposition(m){const fragment=document.createDocumentFragment(),mark=sessionWordmark();const window=el('span',null,'portrait-window');window.setAttribute('aria-hidden','true');const crop=m.portrait_crop,d=crop.diameter,image=el('img');image.src=base+crop.source_image;image.alt='';image.loading='lazy';image.style.width=(crop.width/d*100)+'%';image.style.left=(-(crop.cx-d/2)/d*100)+'%';image.style.top=(-(crop.cy-d/2)/d*100)+'%';window.append(image);fragment.append(mark,window);return fragment;}
 function artVisual(m,sizes='(max-width:600px) 88px, 144px'){
  const kind=m.artwork_kind,classes=kind==='title-composition'?'episode-title-art '+(m.art_layout||'')+(m.topic_photo_position?' topic-photograph':''):kind==='session-composition'?'episode-session-art':kind==='guest-composition'?'episode-guest-art':kind==='instruction-composition'?'instruction-art'+(m.instruction_art_subject==='crucifix'?' instruction-crucifix':''):'episode-original-art';
  const wrap=el('span',null,'episode-preview '+classes),img=el('img');setArtImage(img,m.artwork,sizes);img.alt='';img.loading='lazy';wrap.append(img);
  if(m.topic_photo_position)wrap.style.setProperty('--episode-photo-position',m.topic_photo_position);
  if(kind==='guest-composition')wrap.append(guestComposition(m));
  if(kind==='session-composition')wrap.append(sessionComposition(m));
  if(kind==='title-composition'){const copy=el('span',null,'episode-native-copy');copy.setAttribute('aria-hidden','true');copy.append(mysteryWordmark(),el('strong',m.art_title||m.title),el('span','Family Rosary · Audio','episode-ministry'));wrap.append(copy);}
  if(kind==='instruction-composition'){const copy=el('span',null,'instruction-copy');copy.setAttribute('aria-hidden','true');copy.append(el('strong',m.display_title),el('span','Family Rosary'));wrap.append(copy);}
  return wrap;
 }
 function credits(target,entries){target.replaceChildren();entries.filter(([,v])=>Array.isArray(v)?v.length:v).forEach(([k,v])=>{target.append(el('dt',k),el('dd',Array.isArray(v)?v.join(', '):v));});}
 function setTab(name,focus=false){dialog.querySelectorAll('[role="tab"]').forEach(t=>{const selected=t.id==='cinema-tab-'+name;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;if(selected&&focus)t.focus();});dialog.querySelectorAll('[role="tabpanel"]').forEach(p=>p.hidden=p.id!=='cinema-panel-'+name);}
 function programButton(m,index){const b=el('button',null,'cinema-episode');b.type='button';b.dataset.cinemaId=m.id;if(m.episode_number)b.classList.add('has-episode-number');if(m.id===current.id)b.setAttribute('aria-current','true');if(m.episode_number)b.append(el('span',String(m.episode_number),'cinema-episode-number'));b.append(artVisual(m));const copy=el('span',null,'cinema-episode-copy');copy.append(el('strong',m.display_title));if(m.guest_name)copy.append(el('span','With '+m.guest_name,'cinema-guest'));b.append(copy);const duration=filmed(m)?m.video_alternate.duration_label:m.duration_label;if(duration)b.append(el('span',duration,'cinema-episode-runtime'));return b;}
 function open(m,source,play=false,fromURL=false){
  const wasOpen=dialog.open;dialog.classList.remove('is-playing');
  current=m;if(!dialog.open)trigger=source||document.activeElement;mount.replaceChildren();mount.hidden=true;
  $('#cinema-title').textContent=m.display_title;$('#cinema-series-name').textContent=m.series;$('#cinema-description').textContent=m.description;
  const detailArt=dialog.querySelector('.cinema-detail-art');detailArt.querySelector('.session-wordmark')?.remove();detailArt.querySelector('.session-speakers')?.remove();if(m.artwork_kind==='session-composition')detailArt.prepend(sessionComposition(m));dialog.dataset.topicPhoto=String(Boolean(m.topic_photo_position));if(m.topic_photo_position)detailArt.style.setProperty('--episode-photo-position',m.topic_photo_position);else detailArt.style.removeProperty('--episode-photo-position');
  dialog.dataset.artworkKind=m.artwork_kind||'video';dialog.dataset.artworkSubject=m.instruction_art_subject||'';dialog.dataset.series=m.series;setArtImage($('#cinema-detail-image'),m.artwork,'(max-width:1100px) calc(100vw - 32px), 1024px');const edition=filmed(m)?m.video_alternate:m;$('#cinema-metadata').textContent=[filmed(m)?'Video conversation':m.type==='podcast'?'Podcast episode':'Video',edition.duration_label,edition.published_on?new Date(edition.published_on+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):null,m.youtube_views?new Intl.NumberFormat('en-US').format(m.youtube_views)+' YouTube views (checked '+m.views_checked_on+')':null].filter(Boolean).join(' · ');
  $('#cinema-start').hidden=false;$('#cinema-start span').textContent=filmed(m)?'Watch conversation':m.type==='podcast'?'Listen now':'Watch now';$('#cinema-provider-copy').textContent='Plays here with '+(filmed(m)?m.video_alternate.provider:m.provider)+'.';
  credits($('#cinema-credits'),[['From',m.publisher],['Featuring',m.participants],['Series',m.series]]);
  credits($('#cinema-about'),[['Original title',m.title],['Publisher',m.publisher],['Featuring',m.participants],['Format',filmed(m)?'Video conversation and audio podcast':m.type==='podcast'?'Audio podcast':'Video'],['Language',m.language==='en'?'English':m.language],['Family note',m.audience],['Artwork',m.artwork_note]]);
  const oldPage=dialog.querySelector('.cinema-program-page');if(oldPage)oldPage.remove();if(m.program_path){const page=el('a','Read about this episode','text-link cinema-program-page');page.href=root.dataset.previewPrograms==='true'?(()=>{const u=new URL(location.href);u.searchParams.set('episode',m.id);u.searchParams.delete('play');return u.href;})():new URL(m.id+'/',new URL(root.dataset.programBase,location.href)).href;$('#cinema-about').after(page);}$('#cinema-original').href=m.episode_url||m.playback_url;$('#cinema-original').textContent='Open on '+m.provider;
  const episodes=m.catalog_only&&m.series==='Family Rosary YouTube'?[m]:catalog.filter(x=>x.series===m.series);$('#cinema-episodes-title').textContent=m.series+' · '+episodes.length+' '+(episodes.length===1?'program':'programs');$('#cinema-episodes').replaceChildren(...episodes.map(programButton));
  const related=(relatedBySeries[m.series]||prayerPicks).map(id=>byId.get(id)).filter(x=>x&&x.id!==m.id);$('#cinema-related').replaceChildren(...related.map((x,i)=>programButton(x,i)));
  const oldAlternate=dialog.querySelector('.cinema-alternate');if(oldAlternate)oldAlternate.remove();const alternate=m.video_alternate;if(filmed(m)){const button=el('button','Listen to audio','cinema-primary cinema-alternate');button.type='button';button.addEventListener('click',()=>loadAudio(m));$('#cinema-provider-copy').after(button);}else if(alternate?.embed_url){const label=alternate.visual_format==='audio-with-artwork'?'Play YouTube audio edition':alternate.visual_format==='filmed-conversation'?'Watch conversation':'Watch YouTube edition';const button=el('button',label,'cinema-primary cinema-alternate');button.type='button';button.addEventListener('click',()=>loadVideo(videoSource(m)));$('#cinema-provider-copy').after(button);}
  setTab('episodes');if(!dialog.open)dialog.showModal();dialog.scrollTop=0;if(wasOpen){$('#cinema-title').tabIndex=-1;$('#cinema-title').focus({preventScroll:true});}
  const u=new URL(location.href);u.searchParams.set('episode',m.id);if(!wasOpen&&!fromURL)history.pushState({cinema:true},'',u);else history.replaceState(history.state,'',u);
  if(play)load();
 }
 function load(){if(filmed(current))loadVideo(videoSource(current));else if(current.type==='podcast')loadAudio(current);else loadVideo(current);}
 function loadVideo(m){
  document.dispatchEvent(new Event('fr-recorded-media-play'));
  dialog.classList.add('is-playing');dialog.querySelector('.cinema-detail-body').prepend(mount);stopAudio();if(current.type==='podcast'){$('#cinema-metadata').textContent=[m.visual_format==='audio-with-artwork'?'YouTube audio edition':m.visual_format==='filmed-conversation'?'Video conversation':'YouTube edition',m.duration_label].filter(Boolean).join(' · ');$('#cinema-provider-copy').textContent='Plays here with '+m.provider+'.';}$('#cinema-start').hidden=filmed(current)||current.type!=='podcast';const alternateButton=dialog.querySelector('.cinema-alternate');if(alternateButton)alternateButton.hidden=!filmed(current);mount.replaceChildren();mount.hidden=false;const frame=el('iframe');const u=new URL(m.embed_url);if(m.provider==='YouTube'){u.hostname='www.youtube-nocookie.com';u.searchParams.set('autoplay','1');u.searchParams.set('playsinline','1');}frame.src=u.href;frame.title=m.title;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.dataset.provider=m.provider;
  const fallback=el('a','Open on '+m.provider+' if the player is unavailable.','text-link');fallback.href=m.playback_url;fallback.target='_blank';fallback.rel='noopener noreferrer';
  const loading=el('p','Loading '+m.provider+' player…','cinema-player-loading');loading.setAttribute('role','status');frame.addEventListener('load',()=>loading.remove(),{once:true});if(m.visual_format==='audio-with-artwork')mount.append(el('p','YouTube audio edition · original show artwork','cinema-edition-note'));mount.append(loading,frame,fallback);mount.classList.toggle('cinema-audio-player',false);mount.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'nearest'});frame.focus();
 }
 function loadAudio(m){
  document.dispatchEvent(new Event('fr-recorded-media-play'));
  if(activeAudio?.id===m.id&&audioReady){if(dialog.open){closingForAudio=true;dialog.close();}dock.hidden=false;dock.querySelector('.cinema-dock-minimize').focus();audioWidget?.play();return;}
  stopAudio();mount.replaceChildren();mount.hidden=true;if(dialog.open){closingForAudio=true;dialog.close();}activeAudio=m;dock.hidden=false;setDockCompact(true);dock.querySelector('.cinema-dock-minimize').focus();document.body.classList.add('has-cinema-audio');dock.querySelector('.cinema-dock-title').textContent=m.display_title;dockStatus.textContent='Loading audio controls…';dockIcon(dockToggle,'play','Play audio');dockToggle.hidden=false;
  const frame=el('iframe');const audioURL=new URL(m.embed_url);audioURL.searchParams.set('api','1');audioURL.searchParams.set('auto','1');frame.src=audioURL.href;frame.title=m.title+' — Podbean audio player';frame.allow='autoplay';frame.referrerPolicy='strict-origin-when-cross-origin';frame.dataset.provider='Podbean';dockProvider.append(frame);
  const fallback=el('a','Open the original episode if the player is unavailable.','text-link');fallback.href=m.episode_url||m.playback_url;fallback.target='_blank';fallback.rel='noopener noreferrer';dockProvider.append(fallback);
  const recover=message=>{if(activeAudio?.id!==m.id||!frame.isConnected)return;setDockCompact(false);dock.classList.add('needs-recovery');dockStatus.textContent=message;dockToggle.disabled=false;dockIcon(dockToggle,'play',audioReady?'Play audio':'Retry audio');};
  audioReadyTimer=setTimeout(()=>recover('Audio is taking longer to load. Retry or open the original episode below.'),8000);
  widgetAPI().then(PB=>{if(activeAudio?.id!==m.id||!frame.isConnected)return;const widget=new PB(frame);audioWidget=widget;
   let ready=false,hasPlayed=false;const start=()=>{if(audioWidget!==widget||ready)return;ready=true;audioReady=true;clearTimeout(audioReadyTimer);dockToggle.disabled=false;if(hasPlayed)return;dockStatus.textContent='Use Play if your browser does not start the audio.';audioStartTimer=setTimeout(()=>recover('Press Play to begin, or use the original episode below.'),5000);widget.play();};widget.bind('PB.Widget.Events.READY',start);
   widget.bind('PB.Widget.Events.PLAY',()=>{if(audioWidget!==widget)return;audioReady=true;dockToggle.disabled=false;clearTimeout(audioReadyTimer);clearTimeout(audioStartTimer);dock.classList.remove('needs-recovery');if(!hasPlayed){setDockCompact(true);hasPlayed=true;}dockIcon(dockToggle,'pause','Pause audio');dockStatus.textContent='Playing · keep browsing this page.';});
   widget.bind('PB.Widget.Events.PAUSE',()=>{if(audioWidget!==widget)return;dockIcon(dockToggle,'play','Play audio');dockStatus.textContent='Paused';});
   widget.bind('PB.Widget.Events.FINISH',()=>{if(audioWidget!==widget)return;dockIcon(dockToggle,'play','Play audio');dockStatus.textContent='Episode finished';});widget.isPaused(start);
  }).catch(()=>{if(activeAudio?.id!==m.id||!frame.isConnected)return;clearTimeout(audioReadyTimer);recover('Use the player below, retry, or open the original episode.');});
 }
 function playProgram(m,source,fromURL=false){if(source&&!dialog.contains(source))trigger=source;current=m;if(filmed(m))open(m,source,true,fromURL);else if(m.type==='podcast')loadAudio(m);else open(m,source,true,fromURL);}
 root.addEventListener('click',e=>{const a=e.target.closest('[data-cinema-id]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const m=byId.get(a.dataset.cinemaId);if(m){e.preventDefault();if(a.hasAttribute('data-cinema-details')||a.classList.contains('cinema-details')||a.classList.contains('cinema-series-link'))open(m,a,false);else playProgram(m,a);}});
 $('#cinema-start').addEventListener('click',load);function requestClose(){if(history.state?.cinema)history.back();else dialog.close();}
 document.addEventListener('fr-live-prayer-open',()=>{stopAudio();mount.replaceChildren();mount.hidden=true;if(dialog.open)requestClose();});
 $('.cinema-close').addEventListener('click',requestClose);dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
 window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('episode');if(byId.has(id))open(byId.get(id),null,false,true);else if(dialog.open)dialog.close();});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestClose();});
 dialog.addEventListener('close',()=>{const keepAudioFocus=closingForAudio;closingForAudio=false;mount.replaceChildren();mount.hidden=true;if(keepAudioFocus&&history.state?.cinema){history.back();if(!dock.hidden)dock.querySelector('.cinema-dock-minimize').focus({preventScroll:true});return;}const u=new URL(location.href);u.searchParams.delete('episode');history.replaceState(null,'',u);if(keepAudioFocus){if(!dock.hidden)dock.querySelector('.cinema-dock-minimize').focus({preventScroll:true});return;}const returnTarget=trigger?.isConnected&&trigger.getClientRects().length?trigger:$('#cinema-search');if(returnTarget?.getClientRects().length)returnTarget.focus({preventScroll:true});});
 const tabs=[...dialog.querySelectorAll('[role="tab"]')];tabs.forEach((t,i)=>{t.addEventListener('click',()=>setTab(t.id.replace('cinema-tab-','')));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();setTab(tabs[n].id.replace('cinema-tab-',''),true);});});
 root.querySelectorAll('[data-cinema-scroll][data-shelf]').forEach(b=>{const shelf=document.getElementById(b.dataset.shelf);if(!shelf)return;const update=()=>{const edge=Number(b.dataset.cinemaScroll)<0?shelf.scrollLeft<2:shelf.scrollLeft+shelf.clientWidth>=shelf.scrollWidth-2;b.disabled=edge;};b.addEventListener('click',()=>shelf.scrollBy({left:Number(b.dataset.cinemaScroll)*shelf.clientWidth*.85,behavior:motion.matches?'instant':'smooth'}));shelf.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(shelf);update();});
 const form=$('#cinema-search-form'),results=$('#cinema-search-results'),empty=$('#cinema-search-empty'),more=$('#cinema-search-more'),retry=$('#cinema-search-retry');
 const search=$('#cinema-search'),count=$('#cinema-search-count');
 const copyByLanguage={
  en:{heading:'What would you like to watch or hear?',search:'Search the collection',placeholder:'Try a title, topic or guest’s name',format:'Format',all:'All',video:'Videos',audio:'Podcasts',reset:'Reset',more:'Show more programs',retry:'Try again',empty:'No programs found.',emptyHelp:'Try a shorter search or clear the filters.',count:'Showing {shown} of {total} programs',loading:'Loading the full collection…',error:'The full video collection is temporarily unavailable.',videoType:'Video',audioType:'Audio',both:'Video & audio',with:'With'},
  es:{heading:'¿Qué te gustaría ver o escuchar?',search:'Buscar en la colección',placeholder:'Prueba un título, tema o nombre de un invitado',format:'Formato',all:'Todo',video:'Videos',audio:'Pódcast',reset:'Restablecer',more:'Mostrar más programas',retry:'Volver a intentar',empty:'No se encontraron programas.',emptyHelp:'Prueba una búsqueda más breve o borra los filtros.',count:'Se muestran {shown} de {total} programas',loading:'Cargando la colección completa…',error:'La colección completa de videos no está disponible en este momento.',videoType:'Video',audioType:'Audio',both:'Video y audio',with:'Con'},
  fr:{heading:'Que souhaitez-vous regarder ou écouter ?',search:'Rechercher dans la collection',placeholder:'Essayez un titre, un sujet ou le nom d’une personne invitée',format:'Format',all:'Tout',video:'Vidéos',audio:'Balados',reset:'Réinitialiser',more:'Afficher plus de programmes',retry:'Réessayer',empty:'Aucun programme trouvé.',emptyHelp:'Essayez une recherche plus courte ou effacez les filtres.',count:'{shown} programmes sur {total} affichés',loading:'Chargement de la collection complète…',error:'La collection complète de vidéos est temporairement indisponible.',videoType:'Vidéo',audioType:'Audio',both:'Vidéo et audio',with:'Avec'},
  bn:{heading:'আপনি কী দেখতে বা শুনতে চান?',search:'সংগ্রহে খুঁজুন',placeholder:'শিরোনাম, বিষয় বা অতিথির নাম লিখুন',format:'মাধ্যম',all:'সব',video:'ভিডিও',audio:'পডকাস্ট',reset:'মুছুন',more:'আরও অনুষ্ঠান দেখুন',retry:'আবার চেষ্টা করুন',empty:'কোনো অনুষ্ঠান পাওয়া যায়নি।',emptyHelp:'কম শব্দে খুঁজুন বা ফিল্টার মুছে দিন।',count:'{total}টি অনুষ্ঠানের মধ্যে {shown}টি দেখানো হচ্ছে',loading:'পুরো সংগ্রহ লোড হচ্ছে…',error:'পুরো ভিডিও সংগ্রহ সাময়িকভাবে পাওয়া যাচ্ছে না।',videoType:'ভিডিও',audioType:'অডিও',both:'ভিডিও ও অডিও',with:'সঙ্গে'},
  pt:{heading:'O que você gostaria de ver ou ouvir?',search:'Buscar na coleção',placeholder:'Tente um título, assunto ou nome de convidado',format:'Formato',all:'Tudo',video:'Vídeos',audio:'Podcasts',reset:'Limpar filtros',more:'Mostrar mais programas',retry:'Tentar novamente',empty:'Nenhum programa encontrado.',emptyHelp:'Tente uma busca mais curta ou limpe os filtros.',count:'Mostrando {shown} de {total} programas',loading:'Carregando a coleção completa…',error:'A coleção completa de vídeos está temporariamente indisponível.',videoType:'Vídeo',audioType:'Áudio',both:'Vídeo e áudio',with:'Com'},
  sw:{heading:'Ungependa kutazama au kusikiliza nini?',search:'Tafuta katika mkusanyo',placeholder:'Jaribu kichwa, mada au jina la mgeni',format:'Aina',all:'Zote',video:'Video',audio:'Podikasti',reset:'Futa vichujio',more:'Onyesha vipindi zaidi',retry:'Jaribu tena',empty:'Hakuna vipindi vilivyopatikana.',emptyHelp:'Tafuta kwa maneno machache au futa vichujio.',count:'Vipindi {shown} kati ya {total} vinaonyeshwa',loading:'Mkusanyo mzima unapakiwa…',error:'Mkusanyo mzima wa video haupatikani kwa sasa.',videoType:'Video',audioType:'Sauti',both:'Video na sauti',with:'Pamoja na'},
  it:{heading:'Che cosa vuoi guardare o ascoltare?',search:'Cerca nella raccolta',placeholder:'Prova un titolo, un argomento o il nome di un ospite',format:'Formato',all:'Tutti',video:'Video',audio:'Podcast',reset:'Azzera i filtri',more:'Mostra altri programmi',retry:'Riprova',empty:'Nessun programma trovato.',emptyHelp:'Prova una ricerca più breve o azzera i filtri.',count:'{shown} programmi mostrati su {total}',loading:'Caricamento della raccolta completa…',error:'La raccolta video completa è temporaneamente indisponibile.',videoType:'Video',audioType:'Audio',both:'Video e audio',with:'Con'}
 };
 const locale=(document.documentElement.lang||'en').toLowerCase().split('-')[0];
 const copy=copyByLanguage[locale]||copyByLanguage.en,formatNumber=new Intl.NumberFormat(copyByLanguage[locale]?locale:'en');
 const searchText=(value)=>String(value||'').normalize('NFD').replace(/(\p{Script=Latin})\p{M}+/gu,'$1').normalize('NFC').toLowerCase();
 const mediaMessages=window.frLocalization?.messages||{};
 const translatedField=field=>Object.hasOwn(mediaMessages,field)?mediaMessages[field]:field;
 const searchable=new Map();
 function searchWords(m){
  if(!searchable.has(m.id)){
   const fields=[m.title,m.display_title,m.series,m.description,m.topic,m.guest_name,m.episode_hook].filter(Boolean);
   const translations=fields.map(translatedField).filter((field,index)=>field!==fields[index]);
   searchable.set(m.id,searchText([...fields,...translations].join(' ')));
  }
  return searchable.get(m.id);
 }
 if(locale!=='en'&&copy!==copyByLanguage.en){
  $('#cinema-find h2').textContent=copy.heading;
  form.querySelector('label[for="cinema-search"]').firstChild.textContent=copy.search;
  search.placeholder=copy.placeholder;
  form.querySelector('legend').textContent=copy.format;
  form.querySelectorAll('fieldset label').forEach((label,i)=>label.lastChild.textContent=[copy.all,copy.video,copy.audio][i]);
  form.querySelector('button[type="reset"]').textContent=copy.reset;
  more.textContent=copy.more;retry.textContent=copy.retry;
  empty.querySelector('h3').textContent=copy.empty;empty.querySelector('p').textContent=copy.emptyHelp;
 }
 let extended=[],catalogRequest=null,catalogState='idle',shown=0,found=[];
 const batch=18;
 const listedVideoIds=new Set(catalog.map(m=>filmed(m)?m.video_alternate.embed_url:m.type==='video'?m.embed_url:null).filter(Boolean).map(url=>url.match(/\/embed\/([\w-]{11})(?:\?|$)/)?.[1]).filter(Boolean));
 function channelRecord(row,verifiedOn){
  if(!row||row.embeddable!==true||typeof row.id!=='string'||!(/^[\w-]{11}$/).test(row.id)||typeof row.title!=='string'||!row.title.trim())return null;
  const id='video-'+row.id;
  const seconds=Number.isSafeInteger(row.duration_seconds)&&row.duration_seconds>0?row.duration_seconds:0;
  const duration=seconds?String(Math.floor(seconds/60))+':'+String(seconds%60).padStart(2,'0'):null;
  const language=typeof row.language==='string'&&/^[a-z]{2,3}(?:-[a-z]{2,4})?$/i.test(row.language)?row.language:null;
  const url='https://www.youtube.com/watch?v='+row.id;
  return {id,type:'video',title:row.title,display_title:row.title,series:'Family Rosary YouTube',publisher:'Family Rosary',provider:'YouTube',description:typeof row.description==='string'?row.description.trim().slice(0,2000):'',playback_url:url,source_url:url,embed_url:'https://www.youtube.com/embed/'+row.id,artwork:'https://i.ytimg.com/vi/'+row.id+'/mqdefault.jpg',duration_label:duration,language,published_on:/^\d{4}-\d{2}-\d{2}$/.test(row.published_on||'')?row.published_on:null,youtube_views:verifiedOn&&Number.isSafeInteger(row.views)&&row.views>0?row.views:null,views_checked_on:verifiedOn,catalog_only:true};
 }
 function updateCount(){
  const number=n=>formatNumber.format(n);
  const totals=copy.count.replace('{shown}',number(shown)).replace('{total}',number(found.length));
  count.textContent=[totals,catalogState==='loading'?copy.loading:catalogState==='error'?copy.error:''].filter(Boolean).join(' · ');
  more.hidden=shown>=found.length;
  retry.hidden=catalogState!=='error';
  results.hidden=!shown;
  empty.hidden=!!found.length||catalogState==='loading';
 }
 function appendResults(focus=false,limit=batch){
  const page=found.slice(shown,shown+limit),nodes=page.map(m=>{
   const displayTitle=translatedField(m.display_title);
   const a=el('a',null,'cinema-result'),title=el('strong',displayTitle);
   a.href=filmed(m)?m.video_alternate.url:m.playback_url;a.target='_blank';a.rel='noopener noreferrer';a.dataset.cinemaId=m.id;
   if(m.language&&displayTitle===m.display_title)title.lang=m.language;
   const format=filmed(m)?copy.both:m.type==='podcast'?copy.audioType:copy.videoType;
   const detail=[format,m.catalog_only?m.duration_label:m.series].filter(Boolean).join(' · ');
   a.append(artVisual(m,'(max-width:600px) calc(100vw - 48px), 320px'),title,el('span',detail));
   if(m.guest_name)a.append(el('span',copy.with+' '+m.guest_name,'cinema-guest'));
   return a;
  });
  shown+=nodes.length;results.append(...nodes);updateCount();
  if(focus)nodes[0]?.focus();
 }
 function filter(){
  const words=searchText(search.value).trim().split(/\s+/).filter(Boolean),type=form.querySelector('input:checked').value;
  found=catalog.concat(extended).filter(m=>(!type||m.type===type||(type==='video'&&filmed(m)))&&(!words.length||words.every(word=>searchWords(m).includes(word))));
  shown=0;results.replaceChildren();appendResults();
 }
 function loadCatalog(){
  if(catalogState==='ready')return Promise.resolve();
  if(catalogRequest)return catalogRequest;
  catalogState='loading';updateCount();
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  const url=new URL('channel-catalog.json',new URL(base,document.baseURI));
  catalogRequest=fetch(url,{signal:controller.signal}).then(response=>{
   if(!response.ok)throw new Error('Catalog unavailable');return response.json();
  }).then(data=>{
   if(!Array.isArray(data.videos))throw new Error('Invalid catalog');
   const verifiedOn=/^\d{4}-\d{2}-\d{2}$/.test(data.verified_on||'')?data.verified_on:null;
   for(const row of data.videos){const record=channelRecord(row,verifiedOn);if(record&&!byId.has(record.id)&&!listedVideoIds.has(row.id)){byId.set(record.id,record);extended.push(record);}}
   catalogState='ready';
   // Keep loaded rows and focus stable if the visitor is already browsing curated results.
   const oldShown=shown;
   const words=searchText(search.value).trim().split(/\s+/).filter(Boolean),type=form.querySelector('input:checked').value;
   if(type!=='podcast')found.push(...extended.filter(m=>!words.length||words.every(word=>searchWords(m).includes(word))));
   if(oldShown<batch&&shown<found.length)appendResults(false,batch-shown);else updateCount();
  }).catch(()=>{catalogState='error';updateCount();}).finally(()=>{clearTimeout(timeout);catalogRequest=null;});
  return catalogRequest;
 }
 filter();
 form.addEventListener('input',()=>{filter();if(catalogState==='idle')loadCatalog();});
 form.addEventListener('submit',e=>{e.preventDefault();filter();if(catalogState==='idle')loadCatalog();});
 form.addEventListener('reset',()=>setTimeout(()=>{filter();if(catalogState==='idle')loadCatalog();},0));
 more.addEventListener('click',()=>appendResults(true));
 retry.addEventListener('click',()=>{search.focus();loadCatalog().then(openIntent);});
 if(typeof IntersectionObserver==='function'){
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();if(catalogState==='idle')loadCatalog();}},{rootMargin:'180px'});
  observer.observe($('#cinema-find'));
 }
 const intent=new URLSearchParams(location.search),requested=intent.get('episode');
 function openIntent(){
  const url=new URL(location.href);
  if(!byId.has(requested)||url.searchParams.get('episode')!==requested)return;
  const program=byId.get(requested);
  if(url.searchParams.get('play')!=='1'){open(program,search,false,true);return;}
  url.searchParams.delete('play');
  history.replaceState(history.state,'',url);
  playProgram(program,search,true);
 }
 if(byId.has(requested))openIntent();else if(/^video-[\w-]{11}$/.test(requested||''))loadCatalog().then(openIntent);
})();
