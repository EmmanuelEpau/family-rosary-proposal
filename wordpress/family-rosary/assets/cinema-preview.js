(() => {
 'use strict';
 const root=document.querySelector('.fr-cinema'),hero=root?.querySelector('.cinema-feature');if(!hero)return;
 const navigation=root.querySelector('.cinema-navigation');if(navigation)hero.after(navigation);
 // Two safe portrait windows use the actual left/right halves of the filmed call.
 hero.querySelectorAll('.episode-feature-original').forEach(slide=>{const source=slide.querySelector('.cinema-feature-image');if(!source)return;const portraits=document.createElement('div');portraits.className='cinema-session-portraits';portraits.setAttribute('aria-hidden','true');['guest','host'].forEach(person=>{const panel=document.createElement('span'),image=document.createElement('img');panel.className='cinema-session-'+person;image.src=source.src;image.alt='';panel.append(image);portraits.append(panel);});source.after(portraits);});
 const catalog=new Map(JSON.parse(root.querySelector('#cinema-catalog').textContent).map(item=>[item.id,item]));
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),toggle=hero.querySelector('[data-feature-toggle]'),dialog=root.querySelector('#cinema-dialog');
 let inView=false,current=null,played=null,pending=null,player=null,mount=null,timeout=0,revealTimeout=0,generation=0,apiPromise;
 function youtube(){
  if(window.YT?.Player)return Promise.resolve(window.YT);
  if(apiPromise)return apiPromise;
  apiPromise=new Promise((resolve,reject)=>{const deadline=setTimeout(()=>reject(new Error('Preview unavailable')),8000),previous=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{clearTimeout(deadline);if(typeof previous==='function')previous();resolve(window.YT);};const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.async=true;script.addEventListener('error',()=>{clearTimeout(deadline);reject(new Error('Preview unavailable'));},{once:true});document.head.append(script);});
  return apiPromise;
 }
 function stop(){generation++;pending=null;clearTimeout(timeout);clearTimeout(revealTimeout);if(player){try{player.destroy();}catch{}player=null;}mount?.remove();mount=null;}
 function edition(slide){const id=slide.querySelector('[data-cinema-id]')?.dataset.cinemaId,item=catalog.get(id);if(!item)return null;const video=item.type==='video'?item:item.video_alternate;if(!video?.embed_url)return null;try{const url=new URL(video.embed_url);if(!['www.youtube.com','www.youtube-nocookie.com','youtube.com'].includes(url.hostname))return null;const id=url.pathname.match(/^\/embed\/([\w-]{11})$/)?.[1];return id?{id,title:item.display_title||item.title,start:item.id==='audio-evb7j-1b5554c-pb'?398:15}:null;}catch{return null;}}
 function allowed(){return hero.dataset.featurePaused!=='true'&&inView&&!motion.matches&&!document.hidden&&!dialog?.open&&!document.body.classList.contains('has-cinema-audio')&&!toggle?.getAttribute('aria-label')?.startsWith('Resume');}
 async function sync(){
  const slide=[...hero.querySelectorAll('[data-feature-slide]')].find(s=>!s.hidden);
  if(slide!==current){stop();current=slide;played=null;}
  if(!slide||!allowed()){if(player||mount||pending)stop();return;}
  if(played===slide||pending===slide)return;
  const video=edition(slide);if(!video)return;
  pending=slide;const token=++generation;
  let YT;try{YT=await youtube();}catch{if(token===generation)pending=null;apiPromise=null;return;}
  if(token!==generation||current!==slide||!allowed())return;
  mount=document.createElement('div');mount.className='cinema-muted-preview';mount.setAttribute('aria-hidden','true');const target=document.createElement('div');mount.append(target);slide.prepend(mount);
  const previewMount=mount;let playbackStarted=false;
  player=new YT.Player(target,{host:'https://www.youtube-nocookie.com',videoId:video.id,playerVars:{autoplay:1,mute:1,controls:0,disablekb:1,fs:0,rel:0,playsinline:1,start:video.start,end:video.start+12,origin:location.origin},events:{
   onReady(event){if(token!==generation||!allowed())return;const frame=event.target.getIframe();frame.tabIndex=-1;frame.setAttribute('aria-hidden','true');frame.title='Muted preview: '+video.title;frame.allow='autoplay; encrypted-media';event.target.mute();},
   onStateChange(event){
    if(token!==generation)return;
    clearTimeout(revealTimeout);previewMount.classList.remove('is-playing');
    if(event.data===1){
     if(!playbackStarted){playbackStarted=true;clearTimeout(timeout);timeout=setTimeout(()=>{played=slide;stop();},12000);}
     // Let normal provider startup UI settle. Any pause or buffering restarts this delay.
     revealTimeout=setTimeout(()=>{
      if(token!==generation||!allowed())return;
      let identity='',time=-1,state=-1;
      try{identity=new URL(event.target.getVideoUrl()).searchParams.get('v');time=event.target.getCurrentTime();state=event.target.getPlayerState();}catch{}
      if(state===1&&identity===video.id&&time>=video.start-.5&&time<video.start+12)previewMount.classList.add('is-playing');
     },2500);
    }else if(event.data===0){played=slide;stop();}
   },
   onError(){if(token===generation)stop();}
  }});
  // A blocked provider leaves the original poster and every real Play link usable.
  timeout=setTimeout(()=>{if(!previewMount.classList.contains('is-playing'))stop();},10000);
 }
 const slideObserver=new MutationObserver(sync);slideObserver.observe(hero,{subtree:true,attributes:true,attributeFilter:['hidden','aria-label','data-feature-paused']});
 const foregroundObserver=new MutationObserver(sync);foregroundObserver.observe(document.body,{attributes:true,attributeFilter:['class']});if(dialog)foregroundObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
 const viewport=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync();},{threshold:.2});viewport.observe(hero);
 root.addEventListener('click',event=>{if(event.target.closest('[data-cinema-id]'))stop();},{capture:true});
 hero.addEventListener('focusin',sync);hero.addEventListener('focusout',()=>queueMicrotask(sync));
 document.addEventListener('visibilitychange',sync);motion.addEventListener('change',sync);
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',sync);
})();
