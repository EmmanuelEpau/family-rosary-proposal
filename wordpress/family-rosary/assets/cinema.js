/* Family Rosary's film and audio discovery. Catalog text remains in the document. */
(() => {
 'use strict';
 const root=document.querySelector('.fr-cinema');if(!root)return;
 const $=s=>root.querySelector(s),catalog=JSON.parse($('#cinema-catalog').textContent),byId=new Map(catalog.map(m=>[m.id,m]));
 const base=root.dataset.cinemaBase,dialog=$('#cinema-dialog'),mount=$('#cinema-player-mount'),motion=matchMedia('(prefers-reduced-motion: reduce)');
 let current=null,trigger=null,activeAudio=null,audioWidget=null,widgetPromise=null;
 const dock=document.createElement('section');dock.className='cinema-audio-dock';dock.hidden=true;dock.setAttribute('aria-label','Audio player');
 dock.innerHTML='<div class="cinema-dock-heading"><strong class="cinema-dock-title"></strong><div><button type="button" class="cinema-dock-toggle" disabled></button><button type="button" class="cinema-dock-minimize" aria-expanded="true"></button><button type="button" class="cinema-dock-stop"></button></div></div><p class="cinema-dock-status fr-sr-only" role="status"></p><div class="cinema-dock-provider"></div>';
 root.append(dock);const dockProvider=dock.querySelector('.cinema-dock-provider'),dockToggle=dock.querySelector('.cinema-dock-toggle'),dockStatus=dock.querySelector('.cinema-dock-status');
 function dockIcon(button,kind,label){
  const paths={play:'<path d="m9 5 11 7-11 7z" fill="currentColor" stroke="none"/>',pause:'<path d="M8 5v14M16 5v14" stroke-width="4"/>',expand:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',collapse:'<path d="M3 8h5V3m13 5h-5V3M8 21v-5H3m13 5v-5h5"/>',stop:'<rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" stroke="none"/>'};
  button.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true" focusable="false">'+paths[kind]+'</svg>';button.setAttribute('aria-label',label);button.title=label;
 }
 dockIcon(dockToggle,'play','Play audio');dockIcon(dock.querySelector('.cinema-dock-minimize'),'collapse','Minimize audio controls');dockIcon(dock.querySelector('.cinema-dock-stop'),'stop','Stop audio');
 function stopAudio(){if(audioWidget){['READY','PLAY','PAUSE','FINISH'].forEach(name=>audioWidget.unbind('PB.Widget.Events.'+name));}audioWidget=null;activeAudio=null;const frame=dockProvider.querySelector('iframe');if(frame)frame.src='about:blank';dockProvider.replaceChildren();dock.hidden=true;dockToggle.disabled=true;document.body.classList.remove('has-cinema-audio');}
 function widgetAPI(){if(typeof window.PB==='function')return Promise.resolve(window.PB);if(!widgetPromise)widgetPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://pbcdn1.podbean.com/fs1/player/api.js';script.onload=()=>typeof window.PB==='function'?resolve(window.PB):reject(new Error('Widget unavailable'));script.onerror=reject;document.head.append(script);});return widgetPromise;}
 dock.querySelector('.cinema-dock-stop').addEventListener('click',()=>{stopAudio();if(trigger?.isConnected&&trigger.getClientRects().length)trigger.focus();else $('#cinema-search').focus();});
 function setDockCompact(compact){dock.classList.toggle('is-minimized',compact);const button=dock.querySelector('.cinema-dock-minimize');button.setAttribute('aria-expanded',String(!compact));dockIcon(button,compact?'expand':'collapse',compact?'Show audio controls':'Minimize audio controls');}
 dock.querySelector('.cinema-dock-minimize').addEventListener('click',()=>setDockCompact(!dock.classList.contains('is-minimized')));
 dockToggle.addEventListener('click',()=>{if(audioWidget)audioWidget.toggle();});
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
 const art=m=>base+m.artwork;
 function credits(target,entries){target.replaceChildren();entries.filter(([,v])=>Array.isArray(v)?v.length:v).forEach(([k,v])=>{target.append(el('dt',k),el('dd',Array.isArray(v)?v.join(', '):v));});}
 function setTab(name,focus=false){dialog.querySelectorAll('[role="tab"]').forEach(t=>{const selected=t.id==='cinema-tab-'+name;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;if(selected&&focus)t.focus();});dialog.querySelectorAll('[role="tabpanel"]').forEach(p=>p.hidden=p.id!=='cinema-panel-'+name);}
 function programButton(m,index){const b=el('button',null,'cinema-episode');b.type='button';b.dataset.cinemaId=m.id;if(m.id===current.id)b.setAttribute('aria-current','true');b.append(el('span',String(index+1),'cinema-episode-number'));const image=el('img');image.src=art(m);image.alt='';image.loading='lazy';b.append(image);const copy=el('span',null,'cinema-episode-copy');copy.append(el('strong',m.display_title),el('span',m.description));b.append(copy,el('span',m.duration_label||(m.type==='podcast'?'Audio':'Video'),'cinema-episode-runtime'));return b;}
 function open(m,source,play=false,fromURL=false){
  const wasOpen=dialog.open;
  current=m;if(!dialog.open)trigger=source||document.activeElement;mount.replaceChildren();mount.hidden=true;
  $('#cinema-title').textContent=m.display_title;$('#cinema-series-name').textContent=m.series;$('#cinema-description').textContent=m.description;
  $('#cinema-detail-image').src=art(m);$('#cinema-metadata').textContent=[m.type==='podcast'?'Podcast episode':'Video',m.duration_label,m.published_on?new Date(m.published_on+'T12:00:00').toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}):null,m.youtube_views?new Intl.NumberFormat('en-US').format(m.youtube_views)+' YouTube views (checked '+m.views_checked_on+')':null].filter(Boolean).join(' · ');
  $('#cinema-start').hidden=false;$('#cinema-start span').textContent=m.type==='podcast'?'Listen now':'Watch now';$('#cinema-provider-copy').textContent='Plays here with '+m.provider+'.';
  credits($('#cinema-credits'),[['From',m.publisher],['Featuring',m.participants],['Series',m.series]]);
  credits($('#cinema-about'),[['Original title',m.title],['Publisher',m.publisher],['Featuring',m.participants],['Format',m.type==='podcast'?'Audio podcast':'Video'],['Language',m.language==='en'?'English':m.language],['Family note',m.audience]]);
  $('#cinema-original').href=m.playback_url;$('#cinema-original').textContent='Open on '+m.provider;
  const episodes=catalog.filter(x=>x.series===m.series);$('#cinema-episodes-title').textContent=m.series+' · '+episodes.length+' '+(episodes.length===1?'program':'programs');$('#cinema-episodes').replaceChildren(...episodes.map(programButton));
  const related=(relatedBySeries[m.series]||prayerPicks).map(id=>byId.get(id)).filter(x=>x&&x.id!==m.id);$('#cinema-related').replaceChildren(...related.map((x,i)=>programButton(x,i)));
  setTab('episodes');if(!dialog.open)dialog.showModal();dialog.scrollTop=0;if(wasOpen){$('#cinema-title').tabIndex=-1;$('#cinema-title').focus({preventScroll:true});}
  const u=new URL(location.href);u.searchParams.set('episode',m.id);if(!wasOpen&&!fromURL)history.pushState({cinema:true},'',u);else history.replaceState(history.state,'',u);
  if(play)load();
 }
 function load(){
  if(current.type==='podcast'){loadAudio(current);return;}
  stopAudio();$('#cinema-start').hidden=true;mount.replaceChildren();mount.hidden=false;const frame=el('iframe');const u=new URL(current.embed_url);if(current.provider==='YouTube'){u.hostname='www.youtube-nocookie.com';u.searchParams.set('autoplay','1');u.searchParams.set('playsinline','1');}frame.src=u.href;frame.title=current.title;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';frame.dataset.provider=current.provider;
  const fallback=el('a','Open on '+current.provider+' if the player is unavailable.','text-link');fallback.href=current.playback_url;
  const loading=el('p','Loading '+current.provider+' player…','cinema-player-loading');loading.setAttribute('role','status');frame.addEventListener('load',()=>loading.remove(),{once:true});mount.append(loading,frame,fallback);mount.classList.toggle('cinema-audio-player',current.type==='podcast');mount.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'nearest'});frame.focus();
 }
 function loadAudio(m){
  if(activeAudio?.id===m.id){if(dialog.open)dialog.close();dock.hidden=false;setDockCompact(true);dock.querySelector('.cinema-dock-minimize').focus();audioWidget?.play();return;}
  stopAudio();mount.replaceChildren();mount.hidden=true;if(dialog.open)dialog.close();activeAudio=m;dock.hidden=false;setDockCompact(true);dock.querySelector('.cinema-dock-minimize').focus();document.body.classList.add('has-cinema-audio');dock.querySelector('.cinema-dock-title').textContent=m.series+' · '+m.display_title;dockStatus.textContent='Loading audio controls…';dockIcon(dockToggle,'play','Play audio');dockToggle.hidden=false;
  const frame=el('iframe');const audioURL=new URL(m.embed_url);audioURL.searchParams.set('api','1');frame.src=audioURL.href;frame.title=m.title+' — Podbean audio player';frame.allow='autoplay';frame.referrerPolicy='strict-origin-when-cross-origin';frame.dataset.provider='Podbean';dockProvider.append(frame);
  const fallback=el('a','Open the original episode if the player is unavailable.','text-link');fallback.href=m.episode_url||m.playback_url;dockProvider.append(fallback);
  widgetAPI().then(PB=>{if(activeAudio?.id!==m.id||!frame.isConnected)return;const widget=new PB(frame);audioWidget=widget;
   let ready=false;const start=()=>{if(audioWidget!==widget||ready)return;ready=true;dockToggle.disabled=false;dockStatus.textContent='Use Play if your browser does not start the audio.';widget.play();};widget.bind('PB.Widget.Events.READY',start);widget.isPaused(start);
   widget.bind('PB.Widget.Events.PLAY',()=>{if(audioWidget!==widget)return;dockIcon(dockToggle,'pause','Pause audio');dockStatus.textContent='Playing · keep browsing this page.';});
   widget.bind('PB.Widget.Events.PAUSE',()=>{if(audioWidget!==widget)return;dockIcon(dockToggle,'play','Play audio');dockStatus.textContent='Paused';});
   widget.bind('PB.Widget.Events.FINISH',()=>{if(audioWidget!==widget)return;dockIcon(dockToggle,'play','Play audio');dockStatus.textContent='Episode finished';});
  }).catch(()=>{if(activeAudio?.id===m.id){dockStatus.textContent='Use the Podbean player’s own playback controls.';dockToggle.hidden=true;}});
 }
 function playProgram(m,source){trigger=source||trigger;current=m;if(m.type==='podcast')loadAudio(m);else open(m,source,true);}
 root.addEventListener('click',e=>{const a=e.target.closest('[data-cinema-id]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const m=byId.get(a.dataset.cinemaId);if(m){e.preventDefault();if(a.hasAttribute('data-cinema-details')||a.classList.contains('cinema-details')||a.classList.contains('cinema-series-link'))open(m,a,false);else playProgram(m,a);}});
 $('#cinema-start').addEventListener('click',load);function requestClose(){if(history.state?.cinema)history.back();else dialog.close();}
 $('.cinema-close').addEventListener('click',requestClose);dialog.addEventListener('cancel',e=>{e.preventDefault();requestClose();});
 window.addEventListener('popstate',()=>{const id=new URLSearchParams(location.search).get('episode');if(byId.has(id))open(byId.get(id),null,false,true);else if(dialog.open)dialog.close();});
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)requestClose();});
 dialog.addEventListener('close',()=>{mount.replaceChildren();mount.hidden=true;const u=new URL(location.href);u.searchParams.delete('episode');history.replaceState(history.state,'',u);if(trigger?.isConnected&&trigger.getClientRects().length)trigger.focus({preventScroll:true});});
 const tabs=[...dialog.querySelectorAll('[role="tab"]')];tabs.forEach((t,i)=>{t.addEventListener('click',()=>setTab(t.id.replace('cinema-tab-','')));t.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%tabs.length;else if(e.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=tabs.length-1;else return;e.preventDefault();setTab(tabs[n].id.replace('cinema-tab-',''),true);});});
 root.querySelectorAll('.cinema-scroll').forEach(b=>{const shelf=document.getElementById(b.dataset.shelf);const update=()=>{const edge=Number(b.dataset.cinemaScroll)<0?shelf.scrollLeft<2:shelf.scrollLeft+shelf.clientWidth>=shelf.scrollWidth-2;b.disabled=edge;};b.addEventListener('click',()=>shelf.scrollBy({left:Number(b.dataset.cinemaScroll)*shelf.clientWidth*.85,behavior:motion.matches?'instant':'smooth'}));shelf.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(shelf);update();});
 const form=$('#cinema-search-form'),results=$('#cinema-search-results'),empty=$('#cinema-search-empty');
 function filter(){const q=$('#cinema-search').value.trim().toLowerCase(),type=form.querySelector('input:checked').value;const active=!!(q||type);const found=catalog.filter(m=>(!type||m.type===type)&&(!q||[m.title,m.display_title,m.series,m.description,m.topic].join(' ').toLowerCase().includes(q)));$('#cinema-search-count').textContent=active?found.length+' matching '+(found.length===1?'program':'programs'):catalog.length+' programs in the collection';results.hidden=!active||!found.length;empty.hidden=!active||found.length>0;results.replaceChildren();if(active)found.forEach(m=>{const a=el('a',null,'cinema-result');a.href=m.playback_url;a.dataset.cinemaId=m.id;const img=el('img');img.src=art(m);img.alt='';img.loading='lazy';a.append(img,el('strong',m.display_title),el('span',m.series));results.append(a);});}
 form.addEventListener('input',filter);form.addEventListener('submit',e=>{e.preventDefault();filter();});form.addEventListener('reset',()=>setTimeout(filter,0));
 const intent=new URLSearchParams(location.search),requested=intent.get('episode');if(byId.has(requested)){if(intent.get('play')==='1'){const selected=byId.get(requested);if(selected.type==='video')open(selected,$('#cinema-search'),true,true);else playProgram(selected,$('#cinema-search'));}else open(byId.get(requested),$('#cinema-search'),false,true);}
})();
