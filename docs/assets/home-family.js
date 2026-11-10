(() => {
 'use strict';
 const hero=document.querySelector('.fr-cinematic-hero');if(!hero)return;
 const slides=[...hero.querySelectorAll('[data-family-slide]')],button=hero.querySelector('[data-family-pause]');if(slides.length<2||!button)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,paused=false,inView=false,resumedOnToggle=false,timer;
 const allowed=()=>!paused&&!motion.matches&&inView&&!document.hidden&&(!hero.contains(document.activeElement)||(resumedOnToggle&&document.activeElement===button))&&!document.querySelector('dialog[open]');
 function schedule(){clearTimeout(timer);if(allowed())timer=setTimeout(advance,5000);}
 async function advance(){
  if(!allowed())return;
  const next=(index+1)%slides.length,img=slides[next].querySelector('img');
  try{if(img.decode)await img.decode();}catch{schedule();return;}
  if(!allowed())return;
  slides[index].classList.remove('is-current');slides[index].setAttribute('aria-hidden','true');index=next;
  slides[index].classList.add('is-current');slides[index].setAttribute('aria-hidden','false');schedule();
 }
 function preference(){button.hidden=motion.matches;button.setAttribute('aria-label',paused?'Play family photographs':'Pause family photographs');button.setAttribute('aria-pressed',String(paused));schedule();}
 button.addEventListener('click',()=>{paused=!paused;resumedOnToggle=!paused;preference();});
 hero.addEventListener('focusin',()=>{resumedOnToggle=false;schedule();});hero.addEventListener('focusout',()=>queueMicrotask(schedule));
 document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',preference);
 const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting&&entries[0].intersectionRatio>=.15;schedule();},{threshold:.15});observer.observe(hero);
 const dialogs=new MutationObserver(records=>{if(records.some(record=>record.target instanceof HTMLDialogElement))schedule();});dialogs.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});
 window.addEventListener('pagehide',()=>{clearTimeout(timer);});window.addEventListener('pageshow',schedule);preference();
})();
