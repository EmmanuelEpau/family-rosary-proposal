(() => {
 const scriptURL=document.currentScript.src;
 const stages=document.querySelectorAll('[data-rosary-stage]');
 if(stages.length){let loading=false;const observer=new IntersectionObserver(entries=>{if(!loading&&entries.some(e=>e.isIntersecting)){loading=true;import(new URL('rosary-scene.js',scriptURL).href).catch(()=>{});observer.disconnect();}},{rootMargin:'100px'});stages.forEach(s=>observer.observe(s));}
 document.querySelectorAll('[data-print-guide]').forEach(b=>b.addEventListener('click',()=>window.print()));
 document.querySelectorAll('.fr-age-options details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){d.parentElement.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false;});}}));
 const reader=document.querySelector('[data-prayer-reader]');if(reader){let last='';const update=()=>{const current=document.querySelector('[data-prayer-step][aria-current="step"]');const next=(current?.dataset.prayerStep||'complete')+'|'+document.querySelector('#mystery-number')?.value;if(next!==last){last=next;document.dispatchEvent(new Event('fr-prayer-change'));if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.querySelector('#prayer-words')?.animate([{opacity:.45,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,easing:'cubic-bezier(.16,1,.3,1)'});}};new MutationObserver(update).observe(reader,{attributes:true,subtree:true,attributeFilter:['aria-current']});document.querySelector('#mystery-number')?.addEventListener('change',()=>document.dispatchEvent(new Event('fr-prayer-change')));}
})();
