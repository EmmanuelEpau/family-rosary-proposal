(() => {
 'use strict';
 const $ = (s) => document.querySelector(s);
 const mysteries = {
 joyful:{name:'Joyful',summary:'Reflect on the coming of Jesus and the joy of his early life.',days:[1,6],names:['The Annunciation','The Visitation','The Nativity','The Presentation','The Finding of Jesus in the Temple'],refs:['Luke 1:26–38','Luke 1:39–56','Luke 2:1–20','Luke 2:22–38','Luke 2:41–52']},
 sorrowful:{name:'Sorrowful',summary:'Reflect on the Passion of Jesus and his love for us.',days:[2,5],names:['The Agony in the Garden','The Scourging at the Pillar','The Crowning with Thorns','The Carrying of the Cross','The Crucifixion'],refs:['Matthew 26:36–46','John 19:1','Matthew 27:27–31','John 19:16–17','Luke 23:33–46']},
 glorious:{name:'Glorious',summary:'Reflect on the Resurrection and the hope of new life.',days:[0,3],names:['The Resurrection','The Ascension','The Descent of the Holy Spirit','The Assumption','The Coronation of Mary'],refs:['Luke 24:1–12','Acts 1:6–11','Acts 2:1–13','Reflect on Mary’s Assumption into heaven.','Reflect on Mary crowned Queen of Heaven.']},
 luminous:{name:'Luminous',summary:'Reflect on the public ministry of Jesus, the light of the world.',days:[4],names:['The Baptism of Jesus','The Wedding at Cana','The Proclamation of the Kingdom','The Transfiguration','The Institution of the Eucharist'],refs:['Matthew 3:13–17','John 2:1–11','Mark 1:14–15','Matthew 17:1–8','Luke 22:14–20']}
 };
 const day=new Date(); const todaySet=Object.keys(mysteries).find(k=>mysteries[k].days.includes(day.getDay()));
 if($('[data-today-date]')) $('[data-today-date]').textContent=day.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
 if($('[data-today-mystery]')) $('[data-today-mystery]').textContent='The '+mysteries[todaySet].name+' Mysteries';
 if($('[data-today-summary]')) $('[data-today-summary]').textContent=mysteries[todaySet].summary;
 // Static preview navigation. WordPress keeps its native navigation behavior.
 if(document.body.dataset.preview==='true'){
  const toggle=$('.fr-mobile-toggle'),nav=$('.fr-nav');
  toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('fr-menu-open',open);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('fr-menu-open')){nav.classList.remove('fr-menu-open');toggle.setAttribute('aria-expanded','false');toggle.focus();}});
  nav?.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('fr-menu-open');toggle.setAttribute('aria-expanded','false');}});
 }
 if($('#resource-filters')){
  const form=$('#resource-filters'), search=$('#resource-search'), topic=$('#resource-topic'), format=$('#resource-format'), items=[...document.querySelectorAll('[data-resource], .fr-resource-gallery-card')];
  const params=new URLSearchParams(location.search);
  search.value=params.get('q')||'';topic.value=params.get('topic')||'';format.value=params.get('format')||'';
  const filter=()=>{
   const term=search.value.trim().toLocaleLowerCase(); let count=0;
   items.forEach(item=>{const matches=(!term||item.textContent.toLocaleLowerCase().includes(term))&&(!topic.value||(item.dataset.topics?.split(' ').includes(topic.value)||item.classList.contains('fr-topic-'+topic.value)))&&(!format.value||(item.dataset.format===format.value||item.classList.contains('fr-format-'+format.value.toLowerCase())));item.hidden=!matches;if(matches)count++;});
   $('#resource-count').textContent=count+' '+(count===1?'resource':'resources');$('#resource-empty').hidden=count>0;
   const next=new URL(location.href);for(const [key,value]of [['q',search.value],['topic',topic.value],['format',format.value]])value?next.searchParams.set(key,value):next.searchParams.delete(key);history.replaceState(null,'',next);
  };
  form.addEventListener('input',filter);form.addEventListener('change',filter);form.addEventListener('submit',e=>{e.preventDefault();filter();});form.addEventListener('reset',()=>setTimeout(filter,0));filter();
 }

})();
(() => {
 const form=document.querySelector('#media-filters');
 if(form){
  const cards=[...document.querySelectorAll('[data-media-card]')],rows=[...document.querySelectorAll('[data-media-row]')];
  function filter(){const term=document.querySelector('#media-search').value.trim().toLowerCase();const type=form.querySelector('input[name="media-type"]:checked').value;let count=0;cards.forEach(c=>{const visible=(!type||c.dataset.type===type)&&(!term||(c.textContent+' '+c.dataset.series).toLowerCase().includes(term));c.hidden=!visible;if(visible)count++;});rows.forEach(row=>row.hidden=![...row.querySelectorAll('[data-media-card]')].some(c=>!c.hidden));document.querySelector('#media-result-count').textContent=count+' videos and episodes';document.querySelector('#media-empty').hidden=count>0;}
  form.addEventListener('input',filter);form.addEventListener('submit',e=>{e.preventDefault();filter();});form.addEventListener('reset',()=>setTimeout(filter,0));filter();
 }
 document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>{const shelf=document.getElementById(button.dataset.target);shelf.scrollBy({left:Number(button.dataset.scroll)*Math.max(280,shelf.clientWidth*.85),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}));
 const dialog=document.getElementById('media-dialog');
 if(dialog){
  let trigger=null;const mount=document.getElementById('media-player-mount');
  document.querySelectorAll('[data-media]').forEach(a=>a.addEventListener('click',e=>{
   e.preventDefault();trigger=a;const media=JSON.parse(a.dataset.media);document.getElementById('media-dialog-title').textContent=media.title;document.getElementById('media-dialog-description').textContent=media.description;document.getElementById('media-original').href=media.playback_url;document.getElementById('media-original').textContent='Open on '+media.provider;
   mount.replaceChildren();const panel=document.createElement('div');panel.className='fr-media-start';const text=document.createElement('p');text.textContent='Play this '+(media.provider==='YouTube'?'video':'episode')+' here using '+media.provider+'. Loading the player connects to that service.';const play=document.createElement('button');play.type='button';play.className='fr-primary';play.textContent='Load '+media.provider+' player';panel.append(text,play);mount.append(panel);
   document.getElementById('media-provider-note').textContent='If playback is unavailable, open the original platform using the link below.';
   play.addEventListener('click',()=>{const frame=document.createElement('iframe');let u=new URL(media.embed_url);if(media.provider==='YouTube'){u.hostname='www.youtube-nocookie.com';}frame.src=u.href;frame.title=media.title;frame.dataset.provider=media.provider;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';mount.replaceChildren(frame);});
   dialog.showModal();
  }));
  const requestedEpisode=new URLSearchParams(location.search).get('episode');if(requestedEpisode){const selected=[...document.querySelectorAll('[data-media-id]')].find(e=>e.dataset.mediaId===requestedEpisode);selected?.querySelector('[data-media]')?.click();}
  dialog.querySelector('.fr-dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{mount.replaceChildren();trigger?.focus();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 }
})();
(() => {
 const motion=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('[data-feature-carousel]').forEach(carousel=>{
  const slides=[...carousel.querySelectorAll('[data-feature-slide]')];
  const selectors=[...carousel.querySelectorAll('[data-feature-select]')];
  const toggle=carousel.querySelector('[data-feature-toggle]');
  const status=carousel.querySelector('[data-feature-status]');
  const pauseOnHover=!carousel.classList.contains('cinema-feature');
  const dialog=document.querySelector('#media-dialog, #cinema-dialog');
  if(slides.length<2||!toggle)return;
  let index=0,paused=motion.matches,hovered=matchMedia('(hover: hover)').matches&&carousel.matches(':hover'),inView=true,resumedOnToggle=false,timer,toggleIntent,renderedPaused;
  const canRotate=()=>!paused&&(!pauseOnHover||!hovered)&&inView&&!document.hidden&&!dialog?.open&&(!carousel.contains(document.activeElement)||(resumedOnToggle&&document.activeElement===toggle));
  const schedule=()=>{
   clearTimeout(timer);
   carousel.dataset.featurePaused=String(!canRotate());
   if(renderedPaused!==paused){
    renderedPaused=paused;
    toggle.innerHTML='<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="'+(paused?'M8 5v14l11-7z':'M6 5h4v14H6zm8 0h4v14h-4z')+'"/></svg>';
    toggle.setAttribute('aria-label',paused?'Resume featured selections':'Pause featured selections');
   }
   if(canRotate())timer=setTimeout(()=>{
    if(canRotate())render(index+1);
    schedule();
   },carousel.classList.contains('cinema-feature')?12000:9000);
  };
  const render=(next,announce=false)=>{
   index=(next+slides.length)%slides.length;
   slides.forEach((slide,i)=>{slide.hidden=i!==index;});
   selectors.forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.featureSelect)===index)));
   carousel.dataset.featureIndex=String(index);
   if(announce&&status){const title=slides[index].querySelector('h2')?.textContent||'Featured selection';status.textContent=(index+1)+' of '+slides.length+': '+title;}
  };
  const select=next=>{resumedOnToggle=false;render(next,true);schedule();};
  selectors.forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.featureSelect))));
  carousel.querySelector('[data-feature-prev]')?.addEventListener('click',()=>select(index-1));
  carousel.querySelector('[data-feature-next]')?.addEventListener('click',()=>select(index+1));
  toggle.addEventListener('pointerdown',()=>{toggleIntent=!paused;});
  toggle.addEventListener('pointercancel',()=>{toggleIntent=undefined;});
  toggle.addEventListener('click',()=>{paused=toggleIntent===undefined?!paused:toggleIntent;toggleIntent=undefined;resumedOnToggle=!paused;schedule();});
  carousel.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;schedule();}});
  carousel.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'){hovered=false;schedule();}});
  carousel.addEventListener('focusin',()=>{resumedOnToggle=false;schedule();});
  carousel.addEventListener('focusout',()=>{setTimeout(schedule,0);});
  document.addEventListener('visibilitychange',schedule);
  motion.addEventListener('change',e=>{if(e.matches){paused=true;resumedOnToggle=false;}schedule();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.1}).observe(carousel);
  if(dialog)new MutationObserver(schedule).observe(dialog,{attributes:true,attributeFilter:['open']});
  render(0);carousel.classList.add('is-ready');schedule();
 });
})();
