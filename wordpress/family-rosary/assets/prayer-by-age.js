(() => {
 'use strict';
 const list=document.querySelector('[data-age-tabs]');if(!list)return;
 document.querySelector('.pa-page')?.classList.add('is-enhanced');
 const tabs=[...list.querySelectorAll('[data-age]')],panels=[...document.querySelectorAll('[data-age-panel]')],controllers=new Map();
 for(const panel of panels){
  const steps=[...panel.querySelectorAll('[data-plan-step]')],start=panel.querySelector('[data-plan-start]'),controls=panel.querySelector('[data-plan-controls]'),back=panel.querySelector('[data-plan-back]'),next=panel.querySelector('[data-plan-next]'),progress=panel.querySelector('[data-plan-progress]');let index=0,guided=false,finished=false;
  function render(focus=false){steps.forEach((step,i)=>{step.hidden=guided&&i!==index;});controls.hidden=!guided;start.hidden=guided;back.disabled=index===0;next.disabled=finished;next.textContent=index===steps.length-1?'Finish this prayer':'Next';progress.textContent=finished?'You have reached the end. Rest here, or begin again.':`Part ${index+1} of ${steps.length}`;panel.classList.toggle('is-guided',guided);if(focus)steps[index].querySelector('h4').focus();}
  start.hidden=false;start.addEventListener('click',()=>{guided=true;index=0;finished=false;render(true);});
  back.addEventListener('click',()=>{index=Math.max(0,index-1);finished=false;render(true);});next.addEventListener('click',()=>{if(index<steps.length-1)index++;else finished=true;render(!finished);});
  panel.querySelector('[data-plan-restart]').addEventListener('click',()=>{index=0;finished=false;render(true);});
  panel.querySelector('[data-plan-all]').addEventListener('click',()=>{guided=false;finished=false;index=0;render();start.focus({preventScroll:true});});
  controllers.set(panel.dataset.agePanel,()=>{guided=false;finished=false;index=0;render();});
 }
 list.setAttribute('role','tablist');
 function activate(age,focus=false,save=false){
  const chosen=tabs.find(t=>t.dataset.age===age)||tabs.find(t=>t.dataset.age==='primary');
  tabs.forEach(tab=>{const current=tab===chosen;tab.setAttribute('role','tab');tab.setAttribute('aria-selected',String(current));tab.setAttribute('aria-controls',`pa-${tab.dataset.age}`);tab.tabIndex=current?0:-1;});
  panels.forEach(panel=>{panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',`pa-tab-${panel.dataset.agePanel}`);panel.tabIndex=0;panel.hidden=panel.dataset.agePanel!==chosen.dataset.age;});
  controllers.get(chosen.dataset.age)();
  if(save){const url=new URL(location.href);url.searchParams.set('age',chosen.dataset.age);url.hash='prayer-plan';history.replaceState(null,'',url);}
  if(focus)chosen.focus({preventScroll:true});
 }
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',event=>{event.preventDefault();activate(tab.dataset.age,false,true);});
  tab.addEventListener('keydown',event=>{let n;if(event.key==='ArrowRight')n=(i+1)%tabs.length;else if(event.key==='ArrowLeft')n=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')n=0;else if(event.key==='End')n=tabs.length-1;else if(event.key===' '){event.preventDefault();activate(tab.dataset.age,false,true);return;}else return;event.preventDefault();activate(tabs[n].dataset.age,true,true);});
 });
 function readLocation(){
  const value=new URLSearchParams(location.search).get('age'),aliases={preschool:'babies','babies-preschool':'babies',teenagers:'teens','primary-school':'primary'};
  const hashTab=tabs.find(tab=>location.hash===`#pa-${tab.dataset.age}`),age=hashTab?.dataset.age||(Object.hasOwn(aliases,value)?aliases[value]:value);
  activate(tabs.some(tab=>tab.dataset.age===age)?age:'primary');
  if(hashTab)document.getElementById(`pa-${hashTab.dataset.age}`).scrollIntoView({block:'start',behavior:'instant'});
 }
 window.addEventListener('popstate',readLocation);window.addEventListener('hashchange',readLocation);readLocation();
})();
