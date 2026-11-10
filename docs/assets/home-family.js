(() => {
 'use strict';
 const hero=document.querySelector('.fr-cinematic-hero');if(!hero)return;
 const slides=[...hero.querySelectorAll('[data-family-slide]')],button=hero.querySelector('[data-family-pause]');if(slides.length<2||!button)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,paused=false,inView=false,resumedOnToggle=false,timer,generation=0;
 const allowed=()=>!paused&&!motion.matches&&inView&&!document.hidden&&(!hero.contains(document.activeElement)||(resumedOnToggle&&document.activeElement===button))&&!document.querySelector('dialog[open]');
 function loadPhoto(position){
  const img=slides[position].querySelector('img');
  if(img.dataset.familySource){
   if(img.dataset.familySrcset)img.srcset=img.dataset.familySrcset;
   img.src=img.dataset.familySource;delete img.dataset.familySource;delete img.dataset.familySrcset;
  }
  return img;
 }
 async function prepareNext(token){
  const current=slides[index].querySelector('img');
  try{if(current.decode)await current.decode();}catch{/* A failed first image may still be replaced by a ready photograph. */}
  if(token!==generation||!allowed())return;
  const img=loadPhoto((index+1)%slides.length);
  timer=setTimeout(()=>advance(token),5000);
  try{if(img.decode)await img.decode();}catch{/* Keep the current photograph visible; advance can skip this source. */}
 }
 function schedule(){
  const token=++generation;clearTimeout(timer);
  if(allowed())prepareNext(token);
 }
 async function advance(token){
  if(token!==generation||!allowed())return;
  let next=(index+1)%slides.length;
  for(let attempts=0;attempts<slides.length-1;attempts++){
   if(token!==generation||!allowed())return;
   const img=loadPhoto(next);
   try{if(img.decode)await img.decode();break;}catch{next=(next+1)%slides.length;}
  }
  if(next===index||token!==generation||!allowed())return;
  slides[index].classList.remove('is-current');slides[index].setAttribute('aria-hidden','true');index=next;
  slides[index].classList.add('is-current');slides[index].setAttribute('aria-hidden','false');schedule();
 }
 function preference(){button.hidden=motion.matches;button.setAttribute('aria-label',paused?'Play family photographs':'Pause family photographs');button.setAttribute('aria-pressed',String(paused));schedule();}
 button.addEventListener('click',()=>{paused=!paused;resumedOnToggle=!paused;preference();});
 hero.addEventListener('focusin',()=>{resumedOnToggle=false;schedule();});hero.addEventListener('focusout',()=>queueMicrotask(schedule));
 document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',preference);
 const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;schedule();},{threshold:.15});observer.observe(hero);
 const dialogs=new MutationObserver(records=>{if(records.some(record=>record.target instanceof HTMLDialogElement))schedule();});dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('pagehide',()=>{generation++;clearTimeout(timer);});window.addEventListener('pageshow',schedule);preference();
})();
