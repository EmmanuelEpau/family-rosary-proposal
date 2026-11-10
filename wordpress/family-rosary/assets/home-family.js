(() => {
 'use strict';
 const hero=document.querySelector('.fr-cinematic-hero');if(!hero)return;
 const slides=[...hero.querySelectorAll('[data-family-slide]')],button=hero.querySelector('[data-family-pause]');if(slides.length<2||!button)return;
 const motion=matchMedia('(prefers-reduced-motion: reduce)');let index=0,paused=false,inView=false,hovered=false,timer;
 const allowed=()=>!paused&&!motion.matches&&inView&&!hovered&&!document.hidden&&!hero.contains(document.activeElement);
 function schedule(){clearTimeout(timer);if(allowed())timer=setTimeout(advance,8000);}
 async function advance(){
  if(!allowed())return;
  const next=(index+1)%slides.length,img=slides[next].querySelector('img');
  try{if(img.decode)await img.decode();}catch{schedule();return;}
  if(!allowed())return;
  slides[index].classList.remove('is-current');slides[index].setAttribute('aria-hidden','true');index=next;
  slides[index].classList.add('is-current');slides[index].setAttribute('aria-hidden','false');schedule();
 }
 function preference(){button.hidden=motion.matches;button.setAttribute('aria-label',paused?'Resume family photographs':'Pause family photographs');button.setAttribute('aria-pressed',String(paused));schedule();}
 button.addEventListener('click',()=>{paused=!paused;preference();});
 hero.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hovered=true;schedule();}});hero.addEventListener('pointerleave',()=>{hovered=false;schedule();});
 hero.addEventListener('focusin',schedule);hero.addEventListener('focusout',()=>queueMicrotask(schedule));
 document.addEventListener('visibilitychange',schedule);motion.addEventListener('change',preference);
 const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.15});observer.observe(hero);
 window.addEventListener('pagehide',()=>{clearTimeout(timer);});window.addEventListener('pageshow',schedule);preference();
})();
