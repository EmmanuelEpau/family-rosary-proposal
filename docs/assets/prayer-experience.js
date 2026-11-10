(() => {
 const scriptURL=new URL(document.currentScript.src),sceneURL=new URL('rosary-scene.js',scriptURL);
 sceneURL.search=scriptURL.search;
 const stages=document.querySelectorAll('[data-rosary-stage]');
 if(stages.length){let loading=false;const observer=new IntersectionObserver(entries=>{if(!loading&&entries.some(e=>e.isIntersecting)){loading=true;import(sceneURL.href).catch(()=>{});observer.disconnect();}},{rootMargin:'100px'});stages.forEach(s=>observer.observe(s));}
 document.querySelectorAll('[data-print-guide]').forEach(b=>b.addEventListener('click',()=>window.print()));
 document.querySelectorAll('.fr-age-options details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open){d.parentElement.querySelectorAll('details').forEach(other=>{if(other!==d)other.open=false;});}}));

})();
