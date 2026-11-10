import {chromium} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const base=process.env.BASE_URL||'http://127.0.0.1:9411/';
const out=process.env.QA_DIR||'qa';
const server=process.env.BASE_URL?null:spawn('python3',['-m','http.server','9411','--bind','127.0.0.1','--directory','docs'],{stdio:'ignore'});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={base,checkedAt:new Date().toISOString(),pages:[],interactions:[],limits:['Provider playback availability is external; player mounting is tested, not full viewing/listening.']};
const routes=['','how-to-pray-the-rosary/','prayerresources/','watch-and-listen/','our-story/','rosary-prayer-guide/','family-rosary-companion/','praying-with-children/'];
await mkdir(out+'/screenshots',{recursive:true});
async function ready(){for(let i=0;i<30;i++){try{if((await fetch(base)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Preview server not ready');}
try{
 await ready();
 for(const width of [1440,768,390,320]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
  for(const route of routes){
   const errors=[];const handler=e=>errors.push(e.message);page.on('pageerror',handler);
   const response=await page.goto(new URL(route,base).href);assert.equal(response.status(),200);
   await page.evaluate(async()=>{for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));await document.fonts.ready;});
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,noindex:document.querySelector('meta[name=robots]')?.content.includes('noindex'),brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),liveWidth:document.querySelector('.fr-ministry-bar')?.getBoundingClientRect().width}));
   assert.equal(layout.overflow,false,route+' '+width+' overflow');assert.equal(layout.h1,1);assert.equal(layout.noindex,true);assert.deepEqual(layout.brokenImages,[]);assert.deepEqual(errors,[]);assert.ok(layout.liveWidth>=width-2,'Ministry strip should fill viewport');
   const daily=page.locator('.fr-nav-pray a');assert.match(await daily.getAttribute('href'),/#daily-prayer/);
   let violations=[];if(width===1440||width===390){const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();violations=scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));assert.deepEqual(violations,[],route+' accessibility');await page.screenshot({path:out+'/screenshots/'+(route.split('/')[0]||'home')+'-'+width+'.png',fullPage:true});}
   report.pages.push({route,width,...layout,errors,violations});page.off('pageerror',handler);
  }await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto(new URL('prayerresources/?topic=children',base).href);
 assert.equal(await page.inputValue('#rd-topic'),'children');
 assert.equal(await page.locator('.rd-resource').count(),54);
 assert.ok(await page.locator('.rd-resource:visible').count()>0);
 await page.fill('#rd-search','nonesuchxyz');assert.ok(await page.locator('#rd-empty').isVisible());
 await page.locator('#rd-filters button[type=reset]').click();
 await page.waitForFunction(()=>document.querySelectorAll('.rd-resource:not([hidden])').length===12);
 for(const key of ['q','topic','format','language','view'])assert.equal(new URL(page.url()).searchParams.get(key),null);
 await page.locator('#rd-more').click();assert.equal(await page.locator('.rd-resource:visible').count(),24);
 await page.selectOption('#rd-language','es');
 await page.evaluate(()=>{location.hash='resource-growing';});
 await page.waitForFunction(()=>!document.querySelector('#resource-growing').hidden);
 assert.equal(await page.inputValue('#rd-language'),'');
 assert.match(await page.locator('#resource-growing .rd-action').getAttribute('href'),/praying-with-children|family-prayer-by-age/);
 assert.match(await page.locator('#resource-growing .rd-source').getAttribute('href'),/\.pdf$/i);
 report.interactions.push('54 resources: query, empty/reset, 12-to-24 expansion, language filtering and hidden-anchor reveal');
 await page.goto(new URL('how-to-pray-the-rosary/',base).href);
 await page.click('#prayer-reset');await page.selectOption('#mystery-set','joyful');
 assert.equal(await page.locator('#prayer-jump option').count(),77);
 assert.equal(await page.textContent('#prayer-title'),'The Sign of the Cross');
 await page.click('#prayer-next');assert.equal(await page.textContent('#prayer-title'),'The Apostles’ Creed');
 await page.selectOption('#prayer-jump','76');assert.equal(await page.textContent('#prayer-title'),'The Rosary is complete');
 assert.equal(await page.locator('#prayer-next').isDisabled(),true);
 await page.click('#prayer-reset');assert.equal(await page.locator('#prayer-back').isDisabled(),true);
 report.interactions.push('77-stage Rosary: cross, Creed, closing completion and reset');
 await page.goto(new URL('family-rosary-companion/',base).href);
 assert.equal(await page.locator('#companion-downloads a[href*=".pdf"]').count(),8);
 assert.ok(await page.locator('#companion-try').count());
 await page.goto(new URL('praying-with-children/',base).href);
 assert.ok(await page.locator('main h1').count());
 report.interactions.push('Native Companion activity with eight PDF choices and family-prayer-by-age page');
 await page.goto(new URL('watch-and-listen/',base).href);assert.equal(await page.locator('.cinema-card').count(),57);
 for(const [type,count] of [['video',26],['podcast',35]]){await page.locator('input[name="cinema-format"][value="'+type+'"]').check();assert.equal(await page.locator('#cinema-search-results a').count(),count);}
 await page.fill('#cinema-search','nonesuchxyz');assert.ok(await page.locator('#cinema-search-empty').isVisible());await page.getByRole('button',{name:'Reset',exact:true}).click();
 await page.locator('#family-films .cinema-card-link').first().click();
 assert.ok(await page.locator('#cinema-dialog').isVisible());
 assert.equal(await page.locator('#cinema-player-mount iframe').count(),1);
 await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#cinema-dialog').open);
 assert.equal(await page.locator('#cinema-player-mount iframe').count(),0);
 report.interactions.push('57 unique programs; format filters show 26 videos and 35 podcasts with four filmed podcasts in both, empty/reset, direct card player mounting and unload on close');
 await page.goto(base);await page.locator('.fr-home-media-band a[href*="episode="]').first().click();assert.ok(await page.locator('#cinema-dialog').isVisible());report.interactions.push('Homepage media cards open the selected library player');
 await context.close();
 const phone=await browser.newContext({viewport:{width:390,height:844}});const p=await phone.newPage();await p.goto(base);await p.getByRole('button',{name:'Menu',exact:true}).click();assert.ok(await p.locator('#main-nav').isVisible());await p.keyboard.press('Escape');assert.equal(await p.locator('.fr-mobile-toggle').getAttribute('aria-expanded'),'false');report.interactions.push('Mobile menu and Escape focus return');await phone.close();
 report.status='passed';console.log('Passed: '+report.pages.length+' responsive route checks, 16 accessibility scans and '+report.interactions.length+' interaction groups.');
}catch(error){report.status='failed';report.error=error.stack;console.error(error);process.exitCode=1;}finally{await writeFile(out+'/checks.json',JSON.stringify(report,null,2));await browser.close();server?.kill();}
