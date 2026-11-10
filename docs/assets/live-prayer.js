/* An explicit prayer invitation opens the ministry broadcast without leaving the page. */
(() => {
 'use strict';
 const scheduleURL=window.frLivePrayer?.scheduleURL?new URL(window.frLivePrayer.scheduleURL,document.baseURI):new URL('live-prayer-schedule.json',document.currentScript.src);
 let configPromise=null,cachedConfig=null,cachedUntil=0;
 function schedule(){
  if(configPromise)return configPromise;
  if(cachedConfig&&Date.now()<cachedUntil)return Promise.resolve(cachedConfig);
  const controller=new AbortController();let timer;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Schedule timed out'));},8000);});
  configPromise=Promise.race([fetch(scheduleURL.href,{cache:'no-cache',signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Schedule unavailable');return response.json();}),deadline]).then(config=>{clearTimeout(timer);configPromise=null;cachedConfig=config;cachedUntil=Math.min(Date.now()+30000,Date.parse(config.expires_at)||Infinity);return config;}).catch(()=>{clearTimeout(timer);configPromise=null;cachedConfig=null;cachedUntil=0;return null;});
  return configPromise;
 }
 const triggers=[...document.querySelectorAll('[data-live-prayer]')];if(!triggers.length)return;
 const dialog=document.createElement('dialog');dialog.className='fr-live-dialog';dialog.setAttribute('aria-labelledby','fr-live-title');
 dialog.innerHTML='<div class="fr-live-heading"><div><h2 id="fr-live-title">Daily Rosary &amp; Mass</h2><p>Rosary 11:30 a.m. · Mass noon · Monday–Friday, Eastern Time</p></div><button type="button" class="fr-live-close" aria-label="Close daily prayer"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><p class="fr-live-status" role="status"></p><div class="fr-live-screen"></div><div class="fr-live-recovery"><p>If no broadcast is available, you can pray a recorded Rosary here.</p><div class="fr-live-actions"><a class="fr-primary fr-live-recorded">Pray a recorded Rosary</a><button type="button" class="fr-live-retry" hidden>Try the broadcast again</button><a class="text-link fr-live-original">Open the channel on YouTube</a></div></div>';
 document.body.append(dialog);
 const screen=dialog.querySelector('.fr-live-screen'),status=dialog.querySelector('.fr-live-status'),retry=dialog.querySelector('.fr-live-retry');
 let opener=null,timeout=0,expiry=0,refresh=0,generation=0,player=null,apiPromise,currentVideo=null,endedVideo=null,playing=false,automatic=false;
 function api(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{
   const previous=window.onYouTubeIframeAPIReady,script=document.createElement('script');let settled=false,forwarded=false,timer;
   function finish(error){
    if(settled)return;settled=true;clearTimeout(timer);
    if(window.onYouTubeIframeAPIReady===ready)window.onYouTubeIframeAPIReady=previous;
    if(error){script.remove();apiPromise=null;reject(error);}else resolve(window.YT);
   }
   function ready(){
    // A later controller may wrap this callback; preserve the earlier owner exactly once.
    if(!forwarded){forwarded=true;try{if(typeof previous==='function')previous();}catch{}}
    finish(window.YT?.Player?null:new Error('Player unavailable'));
   }
   window.onYouTubeIframeAPIReady=ready;script.src='https://www.youtube.com/iframe_api';
   script.addEventListener('error',()=>finish(new Error('Player unavailable')),{once:true});
   timer=setTimeout(()=>finish(new Error('Player timed out')),10000);document.head.append(script);
  });return apiPromise;
 }
 function stop(){generation++;clearTimeout(timeout);clearTimeout(expiry);clearTimeout(refresh);currentVideo=null;endedVideo=null;playing=false;if(player){try{player.destroy();}catch{}player=null;}const frame=screen.querySelector('iframe');if(frame)frame.src='about:blank';screen.replaceChildren();document.body.classList.remove('has-live-prayer');}
 function unavailable(message='The broadcast is not available here. Try again, or choose a recorded Rosary.') {status.textContent=message;retry.hidden=false;}
 function candidates(config,channel,now){
  if(!config||config.channel!==channel)return [];
  if(config.version===2){
   if(!Number.isFinite(Date.parse(config.generated_at))||Date.parse(config.generated_at)>now+30000||!(Date.parse(config.expires_at)>now))return [];
   const day=t=>new Date(t).toLocaleDateString('en-CA',{timeZone:'America/New_York'});
   const currentDay=day(now),rank={live:0,upcoming:1,replay:2};
   return (config.programs||[]).filter(p=>{
    if(!/^[\w-]{11}$/.test(p.video_id||'')||!['rosary','mass','combined'].includes(p.kind)||!Object.hasOwn(rank,p.state))return false;
    const scheduled=Date.parse(p.scheduled_start),start=Date.parse(p.actual_start),end=Date.parse(p.actual_end),stamp=Number.isFinite(start)?start:scheduled;
    if(!Number.isFinite(stamp)||day(stamp)!==currentDay)return false;
    if(p.state==='live')return Number.isFinite(start)&&start<=now+30000&&!Number.isFinite(end);
    if(p.state==='replay')return Number.isFinite(start)&&Number.isFinite(end)&&end<=now+30000;
    return Number.isFinite(scheduled)&&!Number.isFinite(start)&&!Number.isFinite(end);
   }).sort((a,b)=>rank[a.state]-rank[b.state]||(a.state==='upcoming'?Date.parse(a.scheduled_start)-Date.parse(b.scheduled_start):Date.parse(b.actual_start)-Date.parse(a.actual_start))).map(p=>({...p,path:p.video_id}));
  }
  const programs=(config.programs||[]).filter(p=>/^[\w-]{11}$/.test(p.video_id||'')&&Number.isFinite(Date.parse(p.scheduled_start))&&now>=Date.parse(p.select_from)&&now<Date.parse(p.expires_at)).sort((a,b)=>Date.parse(b.select_from)-Date.parse(a.select_from));
  const result=programs.slice(0,1).map(p=>({...p,path:p.video_id}));
  if(config.channel_live_embed_verified===true)result.unshift({path:'live_stream',channel,host:['www.youtube.com','www.youtube-nocookie.com'].includes(config.channel_live_embed_host)?config.channel_live_embed_host:'www.youtube-nocookie.com'});
  return result;
 }
 async function play(){
  stop();document.body.classList.add('has-live-prayer');retry.hidden=true;status.textContent='Finding the current broadcast…';const token=generation;
  async function update(){
  const config=await schedule();if(token!==generation||!dialog.open)return;
  const choices=candidates(config,opener.dataset.liveChannel,Date.now()).filter(p=>p.path!==endedVideo);
  clearTimeout(refresh);
  if(config?.version===2)automatic=true;
  if(automatic||window.frLivePrayer?.scheduleURL)refresh=setTimeout(update,60000);
  const retained=config?.version===2&&currentVideo&&(choices.find(p=>p.path===currentVideo&&p.state==='live')||(choices[0]?.path===currentVideo?choices[0]:null));
  if(retained){if(playing){retry.hidden=true;status.textContent=(retained.state==='replay'?'Playing today’s recording: ':'Playing ')+retained.title+'.';}return;}
  if(!choices.length&&currentVideo&&screen.querySelector('iframe')&&(!config||config.discovery?.status==='unavailable')){status.textContent=playing?'The video is playing. Broadcast updates are temporarily unavailable.':'Broadcast updates are temporarily unavailable. Your video remains open.';retry.hidden=false;return;}
  if(!choices.length){if(player){try{player.destroy();}catch{}player=null;}screen.replaceChildren();currentVideo=null;playing=false;unavailable('No current broadcast is confirmed here. Pray a recorded Rosary, or try again shortly.');return;}
  // Refresh at the dated boundary: Rosary becomes Mass at noon; expired IDs never persist as live choices.
  const boundary=(config.programs||[]).map(p=>Date.parse(p.select_from)).concat((config.programs||[]).map(p=>Date.parse(p.expires_at))).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];
  if(config.version!==2&&boundary)expiry=setTimeout(()=>{if(token===generation&&dialog.open)play();},Math.min(boundary-Date.now()+50,2147483647));
  function mount(index){
   if(token!==generation||!dialog.open)return;clearTimeout(timeout);if(player){try{player.destroy();}catch{}player=null;}screen.replaceChildren();
   const choice=choices[index];if(!choice){unavailable();return;}
   const frame=document.createElement('iframe'),url=new URL('https://'+(choice.host||'www.youtube-nocookie.com')+'/embed/'+choice.path);
   if(choice.channel)url.searchParams.set('channel',choice.channel);
   for(const [key,value] of Object.entries({autoplay:'1',playsinline:'1',rel:'0',enablejsapi:'1',origin:location.origin}))url.searchParams.set(key,value);
   frame.title=choice.title||'Family Rosary — current broadcast';frame.src=url.href;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';screen.append(frame);currentVideo=choice.path;playing=false;
   status.textContent=choice.state==='live'?'Joining '+choice.title+'…':choice.state==='replay'?'Today’s recording: '+choice.title+'.':choice.scheduled_start?'Scheduled: '+choice.title+' · '+new Date(choice.scheduled_start).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' Eastern Time.':'Connecting to the current channel broadcast…';
   const active=()=>token===generation&&frame.isConnected&&dialog.open;
   function failed(remove=false){if(!active())return;clearTimeout(timeout);if(index+1<choices.length)mount(index+1);else{if(remove){if(player){try{player.destroy();}catch{}player=null;}screen.replaceChildren();currentVideo=null;playing=false;}unavailable();}}
   frame.addEventListener('error',()=>failed(true));
   timeout=setTimeout(failed,15000);
   api().then(YT=>{if(!active())return;player=new YT.Player(frame,{events:{
    onReady(){if(!active())return;clearTimeout(timeout);retry.hidden=true;if(!choice.scheduled_start)status.textContent='Use the YouTube controls to join the broadcast. If nothing is available, choose a recording below.';},
    onStateChange(event){if(!active())return;playing=event.data===1;if(event.data===1){clearTimeout(timeout);status.textContent=(choice.state==='replay'?'Playing today’s recording: ':'Playing ')+(choice.title||'the channel broadcast')+'.';}else if(event.data===2){status.textContent='Paused '+(choice.title||'the broadcast')+'.';}else if(event.data===0){status.textContent='This broadcast has ended. You can choose a recorded Rosary below.';retry.hidden=false;if(config.version===2){endedVideo=choice.path;cachedUntil=0;update();}}},
    onError:()=>failed(true)
   }});}).catch(()=>{if(active())unavailable('Player controls could not connect. You can use the video if it appears, try again, or choose a recorded Rosary.');});
  }
  mount(0);
  }
  await update();
 }
 function open(trigger){
  const channel=trigger.dataset.liveChannel;if(!/^UC[\w-]{22}$/.test(channel||''))return;
  opener=trigger;dialog.querySelector('.fr-live-recorded').href=trigger.dataset.liveRecorded||'';dialog.querySelector('.fr-live-original').href=trigger.href;
  document.dispatchEvent(new CustomEvent('fr-live-prayer-open'));if(!dialog.open)dialog.showModal();play();dialog.querySelector('.fr-live-close').focus();
 }
 triggers.forEach(trigger=>trigger.addEventListener('click',event=>{if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(!/^UC[\w-]{22}$/.test(trigger.dataset.liveChannel||''))return;event.preventDefault();open(trigger);}));
 dialog.querySelector('.fr-live-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('cancel',event=>{event.preventDefault();dialog.close();});
 dialog.addEventListener('close',()=>{stop();if(opener?.isConnected)opener.focus({preventScroll:true});});
 retry.addEventListener('click',play);
 document.addEventListener('fr-recorded-media-play',()=>{if(dialog.open)dialog.close();else stop();});
 window.addEventListener('pagehide',()=>{if(dialog.open)dialog.close();stop();});
})();
