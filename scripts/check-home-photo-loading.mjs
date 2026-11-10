// Deterministic tests of the shipped photo controller. No browser or network used.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const controller=fs.readFileSync('wordpress/family-rosary/assets/home-family.js','utf8');
class Element {
 constructor(){this.events={};this.attributes={};this.hidden=false;this.dataset={};const classes=new Set();this.classList={add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n)};}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attributes[name]=value;}
}
function setup({reduced=false}={}){
 const requests=[],photos=[],slides=[];let now=0,next=1;const timers=new Map();
 for(let i=0;i<4;i++){
  let state='pending',promise,resolve,reject;const photo=new Element();photo._src=i?'data:image/gif;base64,placeholder':'photos/first.jpg';
  if(i)photo.dataset={familySource:'photos/'+i+'.webp',familySrcset:'photos/'+i+'-640.webp 640w, photos/'+i+'-1280.webp 1280w'};
  Object.defineProperty(photo,'src',{get:()=>photo._src,set:url=>{photo._src=url;if(!url.startsWith('data:'))requests.push(i);}});
  photo.decode=()=>state==='ready'?Promise.resolve():state==='failed'?Promise.reject(new Error('image unavailable')):promise||(promise=new Promise((yes,no)=>{resolve=yes;reject=no;}));
  photo.ready=()=>{state='ready';resolve?.();};photo.fail=()=>{state='failed';reject?.(new Error('image unavailable'));};
  const slide=new Element();slide.querySelector=()=>photo;slide.setAttribute('aria-hidden',String(i!==0));if(!i)slide.classList.add('is-current');photos.push(photo);slides.push(slide);
 }
 const button=new Element(),hero=new Element(),motion=new Element();motion.matches=reduced;
 hero.querySelectorAll=()=>slides;hero.querySelector=()=>button;hero.contains=element=>element===button||element?.insideHero;
 const document=new Element();document.hidden=false;document.body=new Element();document.activeElement=null;document.dialog=null;document.querySelector=selector=>selector==='.fr-cinematic-hero'?hero:document.dialog;
 let intersection;class IntersectionObserver{constructor(callback){intersection=callback;}observe(){}}class MutationObserver{constructor(){}observe(){}}
 const window=new Element();const context=vm.createContext({document,window,HTMLDialogElement:class{},IntersectionObserver,MutationObserver,matchMedia:()=>motion,queueMicrotask,setTimeout:(fn,ms)=>{const id=next++;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)});
 vm.runInContext(controller,context);
 return {requests,photos,slides,button,hero,document,motion,window,current:()=>slides.findIndex(s=>s.classList.contains('is-current')),visible:value=>intersection([{isIntersecting:value,intersectionRatio:value?1:0}]),advance(ms){const end=now+ms;for(;;){const entry=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!entry||entry[1].at>end)break;timers.delete(entry[0]);now=entry[1].at;entry[1].fn();}now=end;},flush:async()=>{for(let i=0;i<10;i++)await Promise.resolve();}};
}
let passed=0,failed=0;async function test(name,run){try{await run();console.log('PASS '+name);passed++;}catch(error){console.error('FAIL '+name+' — '+error.message);failed++;}}
await test('initial markup has one real hero image and three deferred images, with no eager secondary srcset',()=>{
 const html=fs.readFileSync('wordpress/family-rosary/patterns/home.php','utf8'),figures=html.match(/<figure\b[^>]*data-family-slide[\s\S]*?<\/figure>/g);
 assert.equal(figures.length,4);assert.equal(/\ssrc="data:/.test(figures[0]),false);
 for(const figure of figures.slice(1)){assert.match(figure,/\ssrc="data:image\/gif;base64,/);assert.match(figure,/\sdata-family-source=/);assert.match(figure,/\sdata-family-srcset=/);assert.equal(/\ssrcset=/.test(figure),false);}
});
await test('secondary photos remain deferred offscreen and while the first image is still decoding',async()=>{
 const e=setup();await e.flush();assert.deepEqual(e.requests,[]);e.visible(true);e.advance(9000);await e.flush();assert.deepEqual(e.requests,[]);
 e.photos[0].ready();await e.flush();assert.deepEqual(e.requests,[1]);assert.equal(e.current(),0);
});
await test('a loaded next photo replaces the current image only after the display interval',async()=>{
 const e=setup();e.photos[0].ready();e.visible(true);await e.flush();e.photos[1].ready();e.advance(4999);await e.flush();assert.equal(e.current(),0);e.advance(1);await e.flush();assert.equal(e.current(),1);assert.equal(e.slides[0].attributes['aria-hidden'],'true');assert.equal(e.slides[1].attributes['aria-hidden'],'false');assert.deepEqual(e.requests,[1,2]);
});
await test('pause during first decode prevents promotion; explicit focused resume works',async()=>{
 const e=setup();e.visible(true);e.document.activeElement=e.button;e.hero.events.focusin();e.button.events.click();e.photos[0].ready();await e.flush();assert.deepEqual(e.requests,[]);
 e.button.events.click();await e.flush();assert.deepEqual(e.requests,[1]);e.photos[1].ready();e.advance(5000);await e.flush();assert.equal(e.current(),1);
});
await test('reduced motion keeps the first photo and never requests deferred photos',async()=>{
 const e=setup({reduced:true});e.photos[0].ready();e.visible(true);e.advance(30000);await e.flush();assert.deepEqual(e.requests,[]);assert.equal(e.current(),0);assert.equal(e.button.hidden,true);
});
await test('a failed next source is skipped without displaying a blank image',async()=>{
 const e=setup();e.photos[0].ready();e.visible(true);await e.flush();e.photos[1].fail();await e.flush();e.advance(5000);await e.flush();assert.equal(e.current(),0);assert.deepEqual(e.requests,[1,2]);
 e.photos[2].ready();await e.flush();assert.equal(e.current(),2);assert.deepEqual(e.requests,[1,2,3]);
});
await test('pause during a failed pending advance cannot request the following image',async()=>{
 const e=setup();e.photos[0].ready();e.visible(true);await e.flush();e.advance(5000);await e.flush();e.button.events.click();e.photos[1].fail();await e.flush();assert.deepEqual(e.requests,[1]);assert.equal(e.current(),0);
});
await test('offscreen interruption invalidates a pending transition and further fallback requests',async()=>{
 const e=setup();e.photos[0].ready();e.visible(true);await e.flush();e.advance(5000);await e.flush();e.visible(false);e.photos[1].fail();await e.flush();assert.deepEqual(e.requests,[1]);assert.equal(e.current(),0);
});
await test('when every secondary photo fails the current photo remains visible',async()=>{
 const e=setup();e.photos[0].ready();e.photos.slice(1).forEach(photo=>photo.fail());e.visible(true);await e.flush();e.advance(5000);await e.flush();assert.equal(e.current(),0);assert.equal(e.slides[0].attributes['aria-hidden'],'false');
});
await test('a failed first image can recover to a later decoded photograph',async()=>{
 const e=setup();e.photos[0].fail();e.visible(true);await e.flush();assert.deepEqual(e.requests,[1]);e.photos[1].ready();e.advance(5000);await e.flush();assert.equal(e.current(),1);
});
console.log(`${passed} homepage photo regressions passed; ${failed} failed; no browser or network used.`);if(failed)process.exitCode=1;
