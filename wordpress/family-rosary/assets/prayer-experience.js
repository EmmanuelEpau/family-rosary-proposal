(() => {
 const scriptURL=new URL(document.currentScript.src),sceneURL=new URL('rosary-scene.js',scriptURL);
 sceneURL.search=scriptURL.search;
 const stages=document.querySelectorAll('[data-rosary-stage]');
 if(stages.length){let loading=false;const observer=new IntersectionObserver(entries=>{if(!loading&&entries.some(e=>e.isIntersecting)){loading=true;import(sceneURL.href).catch(()=>{});observer.disconnect();}},{rootMargin:'100px'});stages.forEach(s=>observer.observe(s));}
 // A deliberate prayer change must reveal its new words on a narrow screen.
 // Do not move the page on initial load, saved-place restoration or scene readiness.
 let prayerRevealPending=false;
 function revealPrayer(){
  if(prayerRevealPending||!matchMedia('(max-width:760px)').matches)return;
  const title=document.getElementById('prayer-title');if(!title)return;
  prayerRevealPending=true;requestAnimationFrame(()=>{prayerRevealPending=false;
   const bounds=title.getBoundingClientRect(),height=window.visualViewport?.height||window.innerHeight;
   if(bounds.top<16||bounds.bottom>height*.65)title.scrollIntoView({block:'start',behavior:'instant'});
  });
 }
 document.addEventListener('click',event=>{if(event.target.closest('#prayer-back,#prayer-next,#prayer-reset'))revealPrayer();});
 document.addEventListener('change',event=>{if(event.target.matches('#prayer-phase,#prayer-jump,#mystery-number'))revealPrayer();});
 document.addEventListener('fr-rosary-select',revealPrayer);
 document.querySelectorAll('[data-print-guide]').forEach(b=>b.addEventListener('click',()=>window.print()));
 document.querySelectorAll('.fr-age-options details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){d.parentElement.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false;});}}));

})();
