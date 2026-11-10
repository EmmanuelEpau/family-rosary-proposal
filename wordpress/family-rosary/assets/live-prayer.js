/* An explicit prayer invitation opens the ministry broadcast without leaving the page. */
(() => {
 'use strict';
 const scheduleURL=new URL('live-prayer-schedule.json',document.currentScript.src);
 let configPromise=null;
 function schedule(){
  if(configPromise)return configPromise;
  const controller=new AbortController();let timer;
  const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('Schedule timed out'));},8000);});
  configPromise=Promise.race([fetch(scheduleURL.href,{cache:'no-cache',signal:controller.signal}).then(response=>{if(!response.ok)throw new Error('Schedule unavailable');return response.json();}),deadline]).then(config=>{clearTimeout(timer);return config;}).catch(()=>{clearTimeout(timer);configPromise=null;return null;});
  return configPromise;
 }
 const triggers=[...document.querySelectorAll('[data-live-prayer]')];if(!triggers.length)return;
 const dialog=document.createElement('dialog');dialog.className='fr-live-dialog';dialog.setAttribute('aria-labelledby','fr-live-title');
 dialog.innerHTML='<div class="fr-live-heading"><div><h2 id="fr-live-title">Daily Rosary &amp; Mass</h2><p>Rosary 11:30 a.m. · Mass noon · Monday–Friday, Eastern Time</p></div><button type="button" class="fr-live-close" aria-label="Close daily prayer"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><p class="fr-live-status" role="status"></p><div class="fr-live-screen"></div><div class="fr-live-recovery"><p>If no broadcast is available, you can pray a recorded Rosary here.</p><div class="fr-live-actions"><a class="fr-primary fr-live-recorded">Pray a recorded Rosary</a><button type="button" class="fr-live-retry" hidden>Try the broadcast again</button><a class="text-link fr-live-original">Open the channel on YouTube</a></div></div>';
 document.body.append(dialog);
 const screen=dialog.querySelector('.fr-live-screen'),status=dialog.querySelector('.fr-live-status'),retry=dialog.querySelector('.fr-live-retry');
 let opener=null,timeout=0,expiry=0,generation=0,player=null,apiPromise;
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
 function stop(){generation++;clearTimeout(timeout);clearTimeout(expiry);if(player){try{player.destroy();}catch{}player=null;}const frame=screen.querySelector('iframe');if(frame)frame.src='about:blank';screen.replaceChildren();document.body.classList.remove('has-live-prayer');}
 function unavailable(message='The broadcast is not available here. Try again, or choose a recorded Rosary.') {status.textContent=message;retry.hidden=false;}
 function candidates(config,channel,now){
  if(!config||config.channel!==channel)return [];
  const programs=(config.programs||[]).filter(p=>/^[\w-]{11}$/.test(p.video_id||'')&&Number.isFinite(Date.parse(p.scheduled_start))&&now>=Date.parse(p.select_from)&&now<Date.parse(p.expires_at)).sort((a,b)=>Date.parse(b.select_from)-Date.parse(a.select_from));
  const result=programs.slice(0,1).map(p=>({...p,path:p.video_id}));
  if(config.channel_live_embed_verified===true)result.unshift({path:'live_stream',channel,host:['www.youtube.com','www.youtube-nocookie.com'].includes(config.channel_live_embed_host)?config.channel_live_embed_host:'www.youtube-nocookie.com'});
  return result;
 }
 async function play(){
  stop();document.body.classList.add('has-live-prayer');retry.hidden=true;status.textContent='Finding the current broadcast…';const token=generation,config=await schedule();if(token!==generation||!dialog.open)return;
  const choices=candidates(config,opener.dataset.liveChannel,Date.now());
  if(!choices.length){unavailable('No current broadcast is confirmed here. Pray a recorded Rosary, or check the official channel.');return;}
  // Refresh at the dated boundary: Rosary becomes Mass at noon; expired IDs never persist as live choices.
  const boundary=(config.programs||[]).map(p=>Date.parse(p.select_from)).concat((config.programs||[]).map(p=>Date.parse(p.expires_at))).filter(t=>t>Date.now()).sort((a,b)=>a-b)[0];
  if(boundary)expiry=setTimeout(()=>{if(token===generation&&dialog.open)play();},Math.min(boundary-Date.now()+50,2147483647));
  function mount(index){
   if(token!==generation||!dialog.open)return;clearTimeout(timeout);if(player){try{player.destroy();}catch{}player=null;}screen.replaceChildren();
   const choice=choices[index];if(!choice){unavailable();return;}
   const frame=document.createElement('iframe'),url=new URL('https://'+(choice.host||'www.youtube-nocookie.com')+'/embed/'+choice.path);
   if(choice.channel)url.searchParams.set('channel',choice.channel);
   for(const [key,value] of Object.entries({autoplay:'1',playsinline:'1',rel:'0',enablejsapi:'1',origin:location.origin}))url.searchParams.set(key,value);
   frame.title=choice.title||'Family Rosary — current broadcast';frame.src=url.href;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';screen.append(frame);
   status.textContent=choice.scheduled_start?'Scheduled: '+choice.title+' · '+new Date(choice.scheduled_start).toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'})+' Eastern Time.':'Connecting to the current channel broadcast…';
   const active=()=>token===generation&&frame.isConnected&&dialog.open;
   function failed(remove=false){if(!active())return;clearTimeout(timeout);if(index+1<choices.length)mount(index+1);else{if(remove){if(player){try{player.destroy();}catch{}player=null;}screen.replaceChildren();}unavailable();}}
   frame.addEventListener('error',()=>failed(true));
   timeout=setTimeout(failed,15000);
   api().then(YT=>{if(!active())return;player=new YT.Player(frame,{events:{
    onReady(){if(!active())return;clearTimeout(timeout);retry.hidden=true;if(!choice.scheduled_start)status.textContent='Use the YouTube controls to join the broadcast. If nothing is available, choose a recording below.';},
    onStateChange(event){if(!active())return;if(event.data===1){clearTimeout(timeout);status.textContent='Playing '+(choice.title||'the channel broadcast')+'.';}else if(event.data===0){status.textContent='This broadcast has ended. You can choose a recorded Rosary below.';retry.hidden=false;}},
    onError:()=>failed(true)
   }});}).catch(()=>{if(active())unavailable('Player controls could not connect. You can use the video if it appears, try again, or choose a recorded Rosary.');});
  }
  mount(0);
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
