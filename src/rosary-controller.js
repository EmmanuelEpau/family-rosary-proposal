import { rosaryJourney, stateForAnchor } from './rosary-journey.mjs';
const mysteries={
 joyful:{name:'Joyful',summary:'Reflect on the coming of Jesus and the joy of his early life.',days:[1,6],names:['The Annunciation','The Visitation','The Nativity','The Presentation','The Finding of Jesus in the Temple'],refs:['Luke 1:26–38','Luke 1:39–56','Luke 2:1–20','Luke 2:22–38','Luke 2:41–52']},
 sorrowful:{name:'Sorrowful',summary:'Reflect on the Passion of Jesus and his love for us.',days:[2,5],names:['The Agony in the Garden','The Scourging at the Pillar','The Crowning with Thorns','The Carrying of the Cross','The Crucifixion'],refs:['Matthew 26:36–46','John 19:1','Matthew 27:27–31','John 19:16–17','Luke 23:33–46']},
 glorious:{name:'Glorious',summary:'Reflect on the Resurrection and the hope of new life.',days:[0,3],names:['The Resurrection','The Ascension','The Descent of the Holy Spirit','The Assumption','The Coronation of Mary'],refs:['Luke 24:1–12','Acts 1:6–11','Acts 2:1–13','Reflect on Mary’s Assumption into heaven.','Reflect on Mary crowned Queen of Heaven.']},
 luminous:{name:'Luminous',summary:'Reflect on the public ministry of Jesus, the light of the world.',days:[4],names:['The Baptism of Jesus','The Wedding at Cana','The Proclamation of the Kingdom','The Transfiguration','The Institution of the Eucharist'],refs:['Matthew 3:13–17','John 2:1–11','Mark 1:14–15','Matthew 17:1–8','Luke 22:14–20']}
 };
const prayers={"sign": {"title": "The Sign of the Cross", "words": "In the name of the Father and of the Son and of the Holy Spirit. Amen."}, "creed": {"title": "The Apostles’ Creed", "words": "I believe in God, the Father Almighty, creator of heaven and earth, and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; he descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father Almighty; from there he will come again to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen."}, "our": {"title": "Our Father", "words": "Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen."}, "hail": {"title": "Hail Mary", "words": "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."}, "glory": {"title": "Glory Be", "words": "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen."}, "queen": {"title": "Hail, Holy Queen", "words": "Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. To thee do we cry, poor banished children of Eve: to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, O most gracious Advocate, thine eyes of mercy toward us, and after this, our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary!"}, "concluding": {"title": "Concluding prayer", "words": "O God, whose only begotten Son, by His life, death and Resurrection, has purchased for us the rewards of eternal life; grant, we beseech Thee, that by meditating upon these Mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen."}, "dialogue": {"title": "Pray for us, O Holy Mother of God", "words": "Pray for us, O Holy Mother of God. That we may be made worthy of the promises of Christ."}};
const root=document.querySelector('[data-prayer-reader]');
if(root){
 const $=s=>document.querySelector(s),journey=rosaryJourney();let cursor=0;
 const set=$('#mystery-set'),number=$('#mystery-number'),jump=$('#prayer-jump'),phase=$('#prayer-phase');
 const day=new Date().getDay();set.value=Object.keys(mysteries).find(k=>mysteries[k].days.includes(day));
 const storageKey='family-rosary-place:v1',resumeNote=$('#prayer-resume');let restored=false;
 try{
  const saved=JSON.parse(localStorage.getItem(storageKey));
  if(saved&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<journey.length&&Object.hasOwn(mysteries,saved.mysterySet)){
   cursor=saved.step;set.value=saved.mysterySet;restored=cursor>0;
  }
 }catch{/* Prayer remains usable when browser storage is unavailable. */}
 if(resumeNote){resumeNote.hidden=!restored;if(restored)resumeNote.textContent='Your place in the Rosary has been restored.';}

 const label=s=>s.prayerKey==='mystery'?`Name mystery ${s.decade+1}`:s.phase==='complete'?'Rosary complete':`${s.phase==='opening'?'Opening':s.phase==='closing'?'Closing':`Mystery ${s.decade+1}`} · ${prayers[s.prayerKey].title}${s.hailNumber?` ${s.hailNumber} of ${s.phase==='opening'?3:10}`:''}`;
 jump.replaceChildren(...journey.map((s,i)=>new Option(label(s),String(i))));
 function render(focus=false){
  const s=journey[cursor],m=mysteries[set.value],n=s.decade??0;
  $('#prayer-mystery').textContent=s.phase==='decade'?m.names[n]:s.phase==='opening'?'Begin at the cross':s.phase==='closing'?'Close the Rosary':'Thank you for praying';
  $('#prayer-reference').textContent=s.phase==='decade'?m.refs[n]:s.phase==='opening'?'Bring an intention, or hold it quietly in your heart.':s.phase==='closing'?'Return to the medal and close in prayer.':'Take a quiet moment for the intention you brought.';
  const p=s.prayerKey==='mystery'?{title:m.names[n],words:'Bring this mystery to mind. Anyone may offer an intention, lead the responses, or listen quietly.'}:s.prayerKey==='complete'?{title:'The Rosary is complete',words:'You have reached the closing Sign of the Cross. You may rest here or begin again.'}:prayers[s.prayerKey];
  const optional=$('#prayer-fatima');if(optional){optional.hidden=!(s.phase==='decade'&&s.prayerKey==='glory');optional.open=false;}
  $('#prayer-title').textContent=p.title;$('#prayer-words').textContent=p.words;
  $('#prayer-progress-text').textContent=label(s);const progress=$('#prayer-progress');progress.max=journey.length-1;progress.value=cursor;progress.textContent=`${cursor} of ${journey.length-1} steps`;
  $('#prayer-back').disabled=cursor===0;$('#prayer-next').disabled=cursor===journey.length-1;$('#prayer-next').textContent=cursor===journey.length-2?'Finish prayer':'Next prayer';
  jump.value=String(cursor);phase.value=s.phase==='complete'?'closing':s.phase;number.value=String(n);number.disabled=s.phase!=='decade';
  $('#prayer-status').textContent=label(s);
  if(focus&&resumeNote)resumeNote.hidden=true;
  try{localStorage.setItem(storageKey,JSON.stringify({step:cursor,mysterySet:set.value}));}catch{/* Saving is optional; navigation never depends on it. */}

  document.dispatchEvent(new CustomEvent('fr-rosary-state',{detail:{...s,index:cursor,total:journey.length}}));
  if(focus)$('#prayer-title').focus({preventScroll:true});
 }
 function options(){number.replaceChildren(...mysteries[set.value].names.map((n,i)=>new Option(`${i+1}. ${n}`,String(i))));}
 options();set.addEventListener('change',()=>{options();render();});number.addEventListener('change',()=>{cursor=journey.findIndex(s=>s.decade===Number(number.value)&&s.prayerKey==='mystery');render(true);});
 phase.addEventListener('change',()=>{cursor=journey.findIndex(s=>s.phase===phase.value);render(true);});jump.addEventListener('change',()=>{cursor=Number(jump.value);render(true);});
 $('#prayer-back').addEventListener('click',()=>{cursor=Math.max(0,cursor-1);render(true);});$('#prayer-next').addEventListener('click',()=>{cursor=Math.min(journey.length-1,cursor+1);render(true);});$('#prayer-reset').addEventListener('click',()=>{cursor=0;render(true);});
 document.addEventListener('fr-rosary-select',e=>{const i=stateForAnchor(journey,e.detail.anchorId);if(i>=0){cursor=i;render(true);if(matchMedia('(max-width:760px)').matches)root.scrollIntoView({block:'start',behavior:'instant'});}});
 document.querySelectorAll('[data-rosary-material]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-rosary-material]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.dispatchEvent(new CustomEvent('fr-rosary-material',{detail:{material:button.dataset.rosaryMaterial}}));}));
 render();
 // Scene may finish loading after this classic deferred controller.
 document.addEventListener('fr-rosary-ready',()=>render());
}
