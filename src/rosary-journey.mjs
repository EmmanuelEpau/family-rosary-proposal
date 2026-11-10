/** One prayer cursor; physical bead IDs never depend on array order. */
export function rosaryJourney(){
 const out=[];const add=(id,phase,prayerKey,anchorId,extra={})=>out.push({id,phase,prayerKey,anchorId,...extra});
 add('opening-sign','opening','sign','cross');add('opening-creed','opening','creed','cross');add('opening-our','opening','our','opening-our');
 for(let k=1;k<=3;k++)add(`opening-hail-${k}`,'opening','hail',`opening-hail-${k}`,{hailNumber:k});
 add('opening-glory','opening','glory','opening-glory');
 for(let decade=0;decade<5;decade++){
  const base=`decade-${decade+1}`;add(`${base}-mystery`,'decade','mystery',`${base}-our`,{decade});add(`${base}-our`,'decade','our',`${base}-our`,{decade});
  for(let k=1;k<=10;k++)add(`${base}-hail-${k}`,'decade','hail',`${base}-hail-${k}`,{decade,hailNumber:k});
  add(`${base}-glory`,'decade','glory',`${base}-glory`,{decade});
 }
 add('closing-queen','closing','queen','medal');add('closing-dialogue','closing','dialogue','medal');add('closing-prayer','closing','concluding','medal');add('closing-sign','closing','sign','cross');add('complete','complete','complete','cross');
 return out;
}
export function stateForAnchor(journey,anchorId){return journey.findIndex(s=>s.anchorId===anchorId&&s.prayerKey!=='mystery');}
