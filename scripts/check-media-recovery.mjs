// Exercise the shipped controller functions with a deterministic provider and clock.
// This verifies recovery/state races without fetching media or opening another browser.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('wordpress/family-rosary/assets/cinema.js','utf8');
const between=(start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
class Node {
 constructor(tag='div'){this.tagName=tag;this.children=[];this.isConnected=true;this.dataset={};this.listeners={};this.attributes={};this.hidden=false;this.disabled=false;this.textContent='';const classes=new Set();this.classList={add:n=>classes.add(n),remove:n=>classes.delete(n),contains:n=>classes.has(n),toggle:(n,on)=>{on??=!classes.has(n);on?classes.add(n):classes.delete(n);return on;}};this.style={};}
 append(...nodes){this.children.push(...nodes);nodes.forEach(n=>{n.parentElement=this;n.isConnected=true;});}
 replaceChildren(...nodes){this.children.forEach(n=>n.isConnected=false);this.children=[];this.append(...nodes);}
 querySelector(selector){if(selector==='iframe')return this.children.find(n=>n.tagName==='iframe');if(selector==='[role="status"]')return this.children.find(n=>n.attributes.role==='status');return this.parts?.[selector]||null;}
 setAttribute(k,v){this.attributes[k]=v;}
 addEventListener(k,v){this.listeners[k]=v;}
 remove(){this.isConnected=false;if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(n=>n!==this);}
 focus(){}
}
function environment(){
 let now=0,next=1;const timers=new Map(),scripts=[],document={head:new Node('head'),body:new Node('body'),dispatched:[],createElement:tag=>new Node(tag),addEventListener(k,v){this[k]=v;},dispatchEvent(event){this.dispatched.push(event.type);this[event.type]?.(event);return true;}};
 document.head.append=script=>scripts.push(script);
 const clock={setTimeout(fn,delay){const id=next++;timers.set(id,{fn,at:now+delay});return id;},clearTimeout(id){timers.delete(id);},advance(ms){const end=now+ms;for(;;){const entry=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(!entry||entry[1].at>end)break;timers.delete(entry[0]);now=entry[1].at;entry[1].fn();}now=end;}};
 return {document,scripts,clock,window:{},flush:async()=>{for(let i=0;i<8;i++)await Promise.resolve();}};
}
function provider({respond=false,synchronousPlay=true}={}){
 const instances=[];
 class PB {
  constructor(frame){this.frame=frame;this.events={};instances.push(this);}
  bind(name,fn){this.events[name]=fn;}
  unbind(name){delete this.events[name];}
  emit(name){this.events['PB.Widget.Events.'+name]?.();}
  play(){if(synchronousPlay)this.emit('PLAY');}
  toggle(){this.emit('PAUSE');}
  isPaused(callback){if(respond)callback(true);}
 }
 return {PB,instances};
}
function cinema(){
 const env=environment(),dock=new Node(),dockProvider=new Node(),dockToggle=new Node('button'),dockStatus=new Node(),mount=new Node();
 dock.parts={'.cinema-dock-minimize':new Node('button'),'.cinema-dock-title':new Node()};
 const context=vm.createContext({window:env.window,document:env.document,URL,Promise,Event:class{constructor(type){this.type=type;}},setTimeout:env.clock.setTimeout,clearTimeout:env.clock.clearTimeout,dock,dockProvider,dockToggle,dockStatus,mount,dialog:{open:false},el:(tag,text,cls)=>Object.assign(new Node(tag),{textContent:text||'',className:cls||''}),dockIcon:(button,kind,label)=>{button.kind=kind;button.label=label;},setDockCompact:compact=>dock.classList.toggle('is-minimized',compact)});
 vm.runInContext(`let audioWidget=null,activeAudio=null,widgetPromise=null,audioReady=false,audioReadyTimer=0,audioStartTimer=0,closingForAudio=false;\n${between(' function stopAudio()',' dock.querySelector(\'.cinema-dock-stop\')')}\n${between(" dockToggle.addEventListener('click'",' // Editorial selections')}\n${between(' function loadAudio(m)',' function playProgram')}\n${source.split('\n').find(line=>line.includes("document.addEventListener('fr-live-prayer-open'"))||''}\nthis.controller={loadAudio,get ready(){return audioReady;}};`,context);
 return {...env,dock,dockProvider,dockToggle,dockStatus,mount,controller:context.controller};
}
const episode=id=>({id,title:id,display_title:id,embed_url:'https://www.podbean.com/player-v2/?i='+id,episode_url:'https://example.com/'+id});
let passed=0,failed=0;
async function test(name,run){try{await run();console.log('PASS '+name);passed++;}catch(error){console.error('FAIL '+name+' — '+error.message);failed++;}}

await test('stalled API exposes Retry and a subsequent attempt loads a fresh API script',async()=>{
 const e=cinema();e.controller.loadAudio(episode('a'));e.clock.advance(8000);await e.flush();
 assert.equal(e.dock.classList.contains('needs-recovery'),true);assert.equal(e.dock.classList.contains('is-minimized'),false);assert.equal(e.dockToggle.label,'Retry audio');assert.equal(e.scripts[0].isConnected,false);
 e.dockToggle.listeners.click();assert.equal(e.scripts.length,2);
 const p=provider({respond:true});e.window.PB=p.PB;e.scripts[1].onload();await e.flush();
 assert.equal(e.dockStatus.textContent,'Playing · keep browsing this page.');assert.equal(e.dockToggle.disabled,false);assert.equal(e.dockToggle.kind,'pause');
 e.clock.advance(6000);assert.equal(e.dock.classList.contains('needs-recovery'),false);
});
await test('reselecting the same unready episode recreates its provider rather than hiding recovery',async()=>{
 const e=cinema(),p=provider();e.window.PB=p.PB;e.controller.loadAudio(episode('a'));await e.flush();
 const oldFrame=e.dockProvider.querySelector('iframe'),oldPlay=p.instances[0].events['PB.Widget.Events.PLAY'];e.clock.advance(8000);assert.equal(e.dockToggle.label,'Retry audio');
 e.controller.loadAudio(episode('a'));await e.flush();assert.equal(oldFrame.isConnected,false);assert.equal(p.instances.length,2);
 oldPlay();assert.equal(e.dockToggle.kind,'play');p.instances[1].emit('READY');assert.equal(e.dockToggle.kind,'pause');
});
await test('PLAY before READY enables controls without falsely timing out',async()=>{
 const e=cinema(),p=provider();e.window.PB=p.PB;e.controller.loadAudio(episode('a'));await e.flush();p.instances[0].emit('PLAY');
 assert.equal(e.controller.ready,true);assert.equal(e.dockToggle.disabled,false);assert.equal(e.dockToggle.kind,'pause');e.clock.advance(9000);assert.equal(e.dock.classList.contains('needs-recovery'),false);
});
await test('synchronous provider readiness cannot lose PLAY or leave a stale startup timer',async()=>{
 const e=cinema(),p=provider({respond:true});e.window.PB=p.PB;e.controller.loadAudio(episode('a'));await e.flush();
 assert.equal(e.dockToggle.kind,'pause');e.clock.advance(9000);assert.equal(e.dock.classList.contains('needs-recovery'),false);
});
await test('an obsolete failed API request cannot cancel the next episode readiness timeout',async()=>{
 const e=cinema();e.controller.loadAudio(episode('a'));const p=provider();e.window.PB=p.PB;e.controller.loadAudio(episode('b'));await e.flush();
 e.scripts[0].onerror();await e.flush();e.clock.advance(8000);assert.equal(e.dock.classList.contains('needs-recovery'),true);assert.equal(e.dockStatus.textContent.includes('taking longer'),true);
});
await test('resuming a deliberately expanded ready episode preserves its controls',async()=>{
 const e=cinema(),p=provider({respond:true});e.window.PB=p.PB;e.controller.loadAudio(episode('a'));await e.flush();e.dock.classList.remove('is-minimized');
 e.controller.loadAudio(episode('a'));assert.equal(e.dock.classList.contains('is-minimized'),false);assert.equal(p.instances.length,1);
});
await test('standalone audio retries a stalled API and observes immediate PLAY',async()=>{
 const e=environment(),box=new Node(),button=new Node('button');button.parentElement=box;button.dataset={programEmbed:'https://www.podbean.com/player-v2/?i=a',programTitle:'Episode'};
 const context=vm.createContext({window:e.window,document:e.document,URL,Promise,setTimeout:e.clock.setTimeout,clearTimeout:e.clock.clearTimeout});
 vm.runInContext(fs.readFileSync('wordpress/family-rosary/assets/program.js','utf8'),context);
 const click=()=>e.document.click({target:{closest:()=>button}});click();e.clock.advance(8000);await e.flush();assert.equal(button.hidden,false);assert.equal(button.textContent,'Retry audio');
 click();assert.equal(e.scripts.length,2);const p=provider({respond:true});e.window.PB=p.PB;e.scripts[1].onload();await e.flush();
 assert.equal(box.querySelector('[role="status"]').textContent,'Playing');assert.equal(button.hidden,true);e.clock.advance(9000);assert.equal(button.hidden,true);
});
await test('runtime photo candidates exist and switching to other artwork clears old responsive choices',()=>{
 const context=vm.createContext({base:'../assets/'});vm.runInContext(between(' const photoArt=',' const filmed=')+';this.apply=setArtImage;this.photos=photoArt;',context);
 for(const path of context.photos){for(const width of [640,1280])assert.equal(fs.existsSync('wordpress/family-rosary/assets/'+path.slice(0,-4)+'-'+width+'.webp'),true);}
 const img={removeAttribute(name){delete this[name];}};context.apply(img,'photos/crucifix-peyton-center.jpg','144px');assert.match(img.srcset,/-640\.webp 640w/);assert.equal(img.sizes,'144px');
 context.apply(img,'episodes/audio.svg','1024px');assert.equal(img.src,'../assets/episodes/audio.svg');assert.equal(img.srcset,undefined);assert.equal(img.sizes,undefined);
});
await test('starting recorded audio announces exclusive media playback',async()=>{
 const e=cinema(),p=provider({respond:true});e.window.PB=p.PB;e.controller.loadAudio(episode('a'));await e.flush();assert.equal(e.document.dispatched.filter(type=>type==='fr-recorded-media-play').length,1);
});
await test('opening live prayer unmounts the recorded providers and clears audio state',async()=>{
 const e=cinema(),p=provider({respond:true});e.window.PB=p.PB;e.controller.loadAudio(episode('a'));await e.flush();const oldFrame=e.dockProvider.querySelector('iframe');e.mount.append(new Node('iframe'));
 e.document.dispatchEvent({type:'fr-live-prayer-open'});assert.equal(e.dock.hidden,true);assert.equal(oldFrame.isConnected,false);assert.equal(e.mount.children.length,0);assert.equal(e.document.body.classList.contains('has-cinema-audio'),false);
});
console.log(`${passed} media recovery/state regressions passed; ${failed} failed; no browser or network used.`);if(failed)process.exitCode=1;
