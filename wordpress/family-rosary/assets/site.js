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
 if($('[data-prayer-reader]')){
  const set=$('#mystery-set'), number=$('#mystery-number'), jump=$('#prayer-jump'), beads=[...document.querySelectorAll('[data-prayer-step]')]; let step=0;
  const prayers={our:['Our Father','Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.'],hail:['Hail Mary','Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.'],glory:['Glory Be','Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.']};
  const render=(focus=false)=>{
   const m=mysteries[set.value],n=Number(number.value);$('#prayer-mystery').textContent=m.names[n];$('#prayer-reference').textContent=m.refs[n];
   const prayer=step===0?prayers.our:step<=10?prayers.hail:prayers.glory;
   const completed=step===12;
   $('#prayer-title').textContent=completed?'One decade, prayed together.':prayer[0];
   $('#prayer-words').textContent=completed?'Take a moment for the intention you brought. You have completed this decade. You may continue to the next mystery, or close your prayer with the Sign of the Cross. The opening and closing prayer words are available below.':prayer[1];
   $('#prayer-progress-text').textContent=completed?'Decade complete':step===0?'Opening prayer · Our Father':step<=10?'Hail Mary '+step+' of 10':'Closing prayer · Glory Be';
   $('#prayer-progress').value=step;$('#prayer-progress').textContent=step+' of 12 prayers completed';
   $('#prayer-back').disabled=step===0;$('#prayer-next').textContent=completed?(n<4?'Next mystery':'Begin another decade'):step===11?'Complete this decade':'Next prayer';
   if(jump)jump.value=String(Math.min(step,11));
   beads.forEach(bead=>{const current=Number(bead.dataset.prayerStep)===step;if(current)bead.setAttribute('aria-current','step');else bead.removeAttribute('aria-current');bead.classList.toggle('is-complete',Number(bead.dataset.prayerStep)<step);});
   $('#prayer-status').textContent=$('#prayer-progress-text').textContent;
   if(focus)$('#prayer-title').focus({preventScroll:true});
  };
  const chooseSet=()=>{number.replaceChildren(...mysteries[set.value].names.map((n,i)=>new Option((i+1)+'. '+n,String(i))));step=0;render();};
  jump?.addEventListener('change',()=>{step=Number(jump.value);render(true);});
  beads.forEach(bead=>bead.addEventListener('click',()=>{step=Number(bead.dataset.prayerStep);render(true);}));
  set.value=todaySet;chooseSet();set.addEventListener('change',chooseSet);number.addEventListener('change',()=>{step=0;render();});
  $('#prayer-next').addEventListener('click',()=>{if(step<12)step++;else{number.value=String((Number(number.value)+1)%5);step=0;}render(true);});
  $('#prayer-back').addEventListener('click',()=>{step=Math.max(0,step-1);render(true);});$('#prayer-reset').addEventListener('click',()=>{step=0;render(true);});
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
