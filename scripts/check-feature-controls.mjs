// Execute the shipped carousel controller with a deterministic DOM/event model.
// Browser-native pointer/Space activation still requires the internal-browser check.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(process.env.CAROUSEL_SOURCE||'wordpress/family-rosary/assets/site.js','utf8');
const controller=source.slice(source.lastIndexOf('(() => {'));
class Element {
 constructor(){this.events={};this.attributes={};this.dataset={};this.hidden=false;this.replacements=0;const classes=new Set();this.classList={contains:name=>classes.has(name),add:name=>classes.add(name)};}
 addEventListener(name,fn){this.events[name]=fn;}
 setAttribute(name,value){this.attributes[name]=value;}
 getAttribute(name){return this.attributes[name];}
 set innerHTML(value){if(this.icon)this.icon.isConnected=false;this.icon={markup:value,isConnected:true};this.replacements++;}
}
function setup({cinema=true,reduced=false}={}){
 let now=0,next=1;const timers=new Map(),carousel=new Element(),toggle=new Element(),status=new Element(),motion=new Element(),hover={matches:true},prev=new Element(),forward=new Element();motion.matches=reduced;
 if(cinema)carousel.classList.add('cinema-feature');carousel.matches=()=>false;carousel.contains=node=>node===toggle||node?.insideCarousel;
 const slides=Array.from({length:3},(_,i)=>Object.assign(new Element(),{querySelector:()=>({textContent:'Story '+(i+1)})})),selectors=slides.map((_,i)=>{const node=new Element();node.dataset.featureSelect=String(i);return node;});
 carousel.querySelectorAll=selector=>selector==='[data-feature-slide]'?slides:selectors;
 carousel.querySelector=selector=>({'[data-feature-toggle]':toggle,'[data-feature-status]':status,'[data-feature-prev]':prev,'[data-feature-next]':forward}[selector]);
 const document=new Element();document.hidden=false;document.activeElement=null;document.querySelector=()=>null;document.querySelectorAll=()=>[carousel];
 const window={};vm.runInContext(controller,vm.createContext({document,window,matchMedia:q=>q.includes('reduced-motion')?motion:hover,setTimeout:(fn,ms)=>{const id=next++;timers.set(id,{fn,at:now+ms});return id;},clearTimeout:id=>timers.delete(id)}));
 return {carousel,toggle,slides,selectors,status,motion,document,advance(ms){const end=now+ms;for(;;){const entry=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!entry||entry[1].at>end)break;timers.delete(entry[0]);now=entry[1].at;entry[1].fn();}now=end;},focus(){document.activeElement=toggle;carousel.events.focusin();},blur(){document.activeElement=null;carousel.events.focusout();},pointerClick(){const target=toggle.icon;toggle.events.pointerdown();document.activeElement=toggle;carousel.events.focusin();if(target.isConnected){toggle.events.click();return true;}return false;}};
}
let passed=0,failed=0;function test(name,run){try{run();console.log('PASS '+name);passed++;}catch(error){console.error('FAIL '+name+' — '+error.message);failed++;}}
test('focus and hover scheduling preserve the existing icon node',()=>{
 const e=setup(),icon=e.toggle.icon;assert.equal(e.toggle.replacements,1);e.focus();assert.equal(e.toggle.icon,icon);e.carousel.events.pointerenter({pointerType:'mouse'});assert.equal(e.toggle.icon,icon);e.carousel.events.pointerleave({pointerType:'mouse'});e.blur();e.advance(0);assert.equal(e.toggle.icon,icon);assert.equal(e.toggle.replacements,1);
});
test('pointer target survives focus; explicit pause persists after pointer/focus leave',()=>{
 const e=setup();assert.equal(e.pointerClick(),true);assert.equal(e.toggle.getAttribute('aria-label'),'Resume featured selections');assert.equal(e.carousel.dataset.featurePaused,'true');
 e.blur();e.carousel.events.pointerleave({pointerType:'mouse'});e.advance(60000);assert.equal(e.carousel.dataset.featureIndex,'0');assert.equal(e.toggle.getAttribute('aria-label'),'Resume featured selections');
});
test('keyboard click handler pauses persistently and focused resume restarts rotation',()=>{
 const e=setup();e.focus();e.toggle.events.click();assert.equal(e.toggle.getAttribute('aria-label'),'Resume featured selections');e.blur();e.advance(24000);assert.equal(e.carousel.dataset.featureIndex,'0');
 e.focus();e.toggle.events.click();assert.equal(e.toggle.getAttribute('aria-label'),'Pause featured selections');assert.equal(e.carousel.dataset.featurePaused,'false');e.advance(12000);assert.equal(e.carousel.dataset.featureIndex,'1');assert.equal(e.selectors[1].getAttribute('aria-pressed'),'true');
});
test('home hover temporarily pauses rotation without changing explicit pause artwork',()=>{
 const e=setup({cinema:false}),icon=e.toggle.icon;e.carousel.events.pointerenter({pointerType:'mouse'});assert.equal(e.carousel.dataset.featurePaused,'true');assert.equal(e.toggle.icon,icon);e.advance(18000);assert.equal(e.carousel.dataset.featureIndex,'0');
 e.carousel.events.pointerleave({pointerType:'mouse'});e.advance(9000);assert.equal(e.carousel.dataset.featureIndex,'1');assert.equal(e.toggle.icon,icon);
});
test('slide selection and visibility scheduling do not replace the pause icon',()=>{
 const e=setup(),icon=e.toggle.icon;e.selectors[2].events.click();assert.equal(e.carousel.dataset.featureIndex,'2');assert.equal(e.toggle.icon,icon);e.document.hidden=true;e.document.events.visibilitychange();assert.equal(e.carousel.dataset.featurePaused,'true');assert.equal(e.toggle.icon,icon);e.document.hidden=false;e.document.events.visibilitychange();e.advance(12000);assert.equal(e.carousel.dataset.featureIndex,'0');assert.equal(e.toggle.icon,icon);
});
test('reduced motion starts paused and preference changes preserve pause after blur',()=>{
 const e=setup({reduced:true});assert.equal(e.toggle.getAttribute('aria-label'),'Resume featured selections');e.advance(60000);assert.equal(e.carousel.dataset.featureIndex,'0');
 const running=setup();running.motion.matches=true;running.motion.events.change({matches:true});running.blur();running.advance(60000);assert.equal(running.toggle.getAttribute('aria-label'),'Resume featured selections');assert.equal(running.carousel.dataset.featureIndex,'0');
});
console.log(`${passed} feature-control regressions passed; ${failed} failed; no browser or network used.`);if(failed)process.exitCode=1;
