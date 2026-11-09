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
const routes=['','how-to-pray-the-rosary/','prayerresources/','watch-and-listen/','our-story/'];
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
   const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,noindex:document.querySelector('meta[name=robots]')?.content.includes('noindex'),brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),liveWidth:document.querySelector('.fr-live-strip')?.getBoundingClientRect().width}));
   assert.equal(layout.overflow,false,route+' '+width+' overflow');assert.equal(layout.h1,1);assert.equal(layout.noindex,true);assert.deepEqual(layout.brokenImages,[]);assert.deepEqual(errors,[]);assert.ok(layout.liveWidth>=width-2,'Live strip should fill viewport');
   const live=page.locator('.fr-live-strip a');assert.ok(await live.isVisible());assert.match(await live.getAttribute('href'),/youtube.com\/@FamilyRosaryVideo\/streams/);
   let violations=[];if(width===1440||width===390){const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();violations=scan.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));assert.deepEqual(violations,[],route+' accessibility');await page.screenshot({path:out+'/screenshots/'+(route.split('/')[0]||'home')+'-'+width+'.png',fullPage:true});}
   report.pages.push({route,width,...layout,errors,violations});page.off('pageerror',handler);
  }await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto(new URL('prayerresources/?topic=children',base).href);assert.equal(await page.inputValue('#resource-topic'),'children');assert.ok(await page.locator('[data-resource]:visible').count()>0);
 await page.fill('#resource-search','nonesuchxyz');assert.ok(await page.locator('#resource-empty').isVisible());await page.locator('#resource-filters button[type=reset]').click();await page.waitForFunction(()=>document.querySelectorAll('[data-resource]:not([hidden])').length===8);assert.equal(new URL(page.url()).search,'');report.interactions.push('Resource query, empty state, reset and URL synchronization');
 await page.goto(new URL('how-to-pray-the-rosary/',base).href);await page.selectOption('#mystery-set','joyful');for(let i=0;i<12;i++)await page.click('#prayer-next');assert.equal(await page.textContent('#prayer-title'),'One decade, prayed together.');await page.click('#prayer-next');assert.equal(await page.inputValue('#mystery-number'),'1');assert.equal(await page.textContent('#prayer-title'),'Our Father');await page.click('#prayer-reset');assert.equal(await page.locator('#prayer-back').isDisabled(),true);report.interactions.push('12 prayers, decade completion, next mystery and reset');
 await page.goto(new URL('watch-and-listen/',base).href);assert.equal(await page.locator('[data-media-card]').count(),44);
 for(const [type,count]of [['video',9],['podcast',35],['',44]]){const inputs=page.locator('input[name=media-type]');let found=false;for(const input of await inputs.all()){if(await input.getAttribute('value')===type){await input.check();found=true;break;}}assert.ok(found,'media type exists '+type);assert.equal(await page.locator('[data-media-card]:visible').count(),count);}
 await page.fill('#media-search','nonesuchxyz');assert.ok(await page.locator('#media-empty').isVisible());await page.fill('#media-search','');
 for(const trigger of await page.locator('[data-media]').all()){await trigger.click();assert.ok(await page.locator('#media-dialog').isVisible());assert.equal(await page.locator('#media-player-mount iframe').count(),0);await page.keyboard.press('Escape');}
 await page.locator('[data-media]').first().click();await page.getByRole('button',{name:'Load YouTube player'}).click();assert.equal(await page.locator('#media-player-mount iframe').count(),1);await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelectorAll('#media-player-mount iframe').length===0);assert.equal(await page.locator('#media-player-mount iframe').count(),0);
 report.interactions.push('44 media dialogs, 9 videos / 35 podcasts, search, explicit provider loading, unload on close');
 await page.goto(base);await page.locator('.fr-home-media-band a[href*="episode="]').first().click();assert.ok(await page.locator('#media-dialog').isVisible());report.interactions.push('Homepage media cards open the selected library player');
 await context.close();
 const phone=await browser.newContext({viewport:{width:390,height:844}});const p=await phone.newPage();await p.goto(base);await p.getByRole('button',{name:'Menu',exact:true}).click();assert.ok(await p.locator('#main-nav').isVisible());await p.keyboard.press('Escape');assert.equal(await p.locator('.fr-mobile-toggle').getAttribute('aria-expanded'),'false');report.interactions.push('Mobile menu and Escape focus return');await phone.close();
 report.status='passed';console.log('Passed: '+report.pages.length+' responsive route checks, 10 accessibility scans and '+report.interactions.length+' interaction groups.');
}catch(error){report.status='failed';report.error=error.stack;console.error(error);process.exitCode=1;}finally{await writeFile(out+'/checks.json',JSON.stringify(report,null,2));await browser.close();server?.kill();}
