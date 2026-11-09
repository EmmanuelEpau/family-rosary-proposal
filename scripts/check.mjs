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
const routes=['','how-to-pray-the-rosary/','prayerresources/','watch-and-listen/','our-story/','rosary-prayer-guide/'];
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
 await page.goto(new URL('prayerresources/?topic=children',base).href);assert.equal(await page.inputValue('#resource-topic'),'children');assert.ok(await page.locator('.fr-resource-gallery-card:visible').count()>0);
 await page.fill('#resource-search','nonesuchxyz');assert.ok(await page.locator('#resource-empty').isVisible());await page.locator('#resource-filters button[type=reset]').click();await page.waitForFunction(()=>document.querySelectorAll('.fr-resource-gallery-card:not([hidden])').length===12);for(const key of ['q','topic','format'])assert.equal(new URL(page.url()).searchParams.get(key),null);report.interactions.push('Resource query, empty state, reset and URL synchronization');
 await page.goto(new URL('how-to-pray-the-rosary/',base).href);await page.selectOption('#mystery-set','joyful');for(let i=0;i<12;i++)await page.click('#prayer-next');assert.equal(await page.textContent('#prayer-title'),'One decade, prayed together.');await page.click('#prayer-next');assert.equal(await page.inputValue('#mystery-number'),'1');assert.equal(await page.textContent('#prayer-title'),'Our Father');await page.click('#prayer-reset');assert.equal(await page.locator('#prayer-back').isDisabled(),true);report.interactions.push('12 prayers, decade completion, next mystery and reset');
 await page.goto(new URL('watch-and-listen/',base).href);assert.equal(await page.locator('.cinema-card').count(),57);
 for(const [type,count] of [['video',22],['podcast',35]]){await page.locator('input[name="cinema-format"][value="'+type+'"]').check();assert.equal(await page.locator('#cinema-search-results a').count(),count);}
 await page.fill('#cinema-search','nonesuchxyz');assert.ok(await page.locator('#cinema-search-empty').isVisible());await page.getByRole('button',{name:'Reset',exact:true}).click();
 await page.locator('#family-films .cinema-card-link').first().click();assert.ok(await page.locator('#cinema-dialog').isVisible());assert.equal(await page.locator('#cinema-player-mount iframe').count(),0);
 await page.locator('#cinema-episodes button[data-cinema-id="video-3Hpny2VtT9U"]').press('Enter');assert.equal(await page.locator('#cinema-title').evaluate(e=>e===document.activeElement),true);
 await page.getByRole('tab',{name:'More to explore',exact:true}).click();assert.ok(await page.locator('#cinema-panel-related').isVisible());assert.ok(await page.locator('#cinema-related button').count()>0);
 await page.getByRole('button',{name:'Watch now',exact:true}).click();assert.equal(await page.locator('#cinema-player-mount iframe').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>!document.querySelector('#cinema-dialog').open);assert.equal(await page.locator('#cinema-player-mount iframe').count(),0);
 report.interactions.push('57 programs, 22 videos / 35 podcasts, empty/reset, episode focus, curated related, explicit provider loading and unload on close');
 await page.goto(base);await page.locator('.fr-home-media-band a[href*="episode="]').first().click();assert.ok(await page.locator('#cinema-dialog').isVisible());report.interactions.push('Homepage media cards open the selected library player');
 await context.close();
 const phone=await browser.newContext({viewport:{width:390,height:844}});const p=await phone.newPage();await p.goto(base);await p.getByRole('button',{name:'Menu',exact:true}).click();assert.ok(await p.locator('#main-nav').isVisible());await p.keyboard.press('Escape');assert.equal(await p.locator('.fr-mobile-toggle').getAttribute('aria-expanded'),'false');report.interactions.push('Mobile menu and Escape focus return');await phone.close();
 report.status='passed';console.log('Passed: '+report.pages.length+' responsive route checks, 10 accessibility scans and '+report.interactions.length+' interaction groups.');
}catch(error){report.status='failed';report.error=error.stack;console.error(error);process.exitCode=1;}finally{await writeFile(out+'/checks.json',JSON.stringify(report,null,2));await browser.close();server?.kill();}
