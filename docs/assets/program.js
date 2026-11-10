/* A program's own page keeps the same single-click playback contract as the library. */
(() => {
 let api;
 function podbean(){
  if(typeof window.PB==='function')return Promise.resolve(window.PB);
  if(!api)api=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://pbcdn1.podbean.com/fs1/player/api.js';script.onload=()=>typeof window.PB==='function'?resolve(window.PB):reject(new Error('Player unavailable'));script.onerror=reject;document.head.append(script);}).catch(error=>{api=null;throw error;});
  return api;
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-program-embed]');if(!button)return;
  const box=button.parentElement;box.querySelector('iframe')?.remove();box.querySelector('[role="status"]')?.remove();
  const frame=document.createElement('iframe'),url=new URL(button.dataset.programEmbed),audio=url.hostname.includes('podbean');
  url.searchParams.set(audio?'auto':'autoplay','1');url.searchParams.set('playsinline','1');if(audio)url.searchParams.set('api','1');
  frame.src=url.href;frame.title=button.dataset.programTitle;frame.allow='autoplay; encrypted-media; picture-in-picture';frame.allowFullscreen=true;frame.style.cssText='width:100%;aspect-ratio:16/9;border:0;max-height:70vh;min-height:260px';
  button.hidden=true;box.append(frame);frame.focus();
  if(!audio)return;
  const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Loading audio…';box.append(status);
  const recover=()=>{if(!frame.isConnected)return;status.textContent='Use the player, retry, or open the original episode.';button.textContent='Retry audio';button.hidden=false;};
  const timeout=setTimeout(recover,8000);
  podbean().then(PB=>{if(!frame.isConnected)return;const widget=new PB(frame);let started=false;const play=()=>{if(started||!frame.isConnected)return;started=true;widget.play();};widget.bind('PB.Widget.Events.READY',play);widget.isPaused(play);widget.bind('PB.Widget.Events.PLAY',()=>{if(!frame.isConnected)return;clearTimeout(timeout);status.textContent='Playing';button.hidden=true;});}).catch(()=>{clearTimeout(timeout);recover();});
 });
})();
