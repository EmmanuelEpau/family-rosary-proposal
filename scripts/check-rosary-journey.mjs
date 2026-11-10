import assert from 'node:assert/strict';
import { rosaryJourney,stateForAnchor } from '../src/rosary-journey.mjs';
import { rosaryLayout,rosaryEdges,beadRadius,connector } from '../src/rosary-layout.mjs';
const states=rosaryJourney(),nodes=rosaryLayout(),edges=rosaryEdges(nodes);
assert.equal(nodes.length,59);assert.equal(nodes.filter(n=>n.kind==='our').length,6);assert.equal(nodes.filter(n=>n.kind==='hail').length,53);assert.equal(new Set(nodes.map(n=>n.id)).size,59);
assert.equal(states[0].id,'opening-sign');assert.equal(states[1].id,'opening-creed');assert.equal(states.at(-1).phase,'complete');assert.equal(states.at(-2).id,'closing-sign');
for(const [prayer,count]of [['our',6],['hail',53],['glory',6],['mystery',5],['queen',1],['dialogue',1],['concluding',1]])assert.equal(states.filter(s=>s.prayerKey===prayer).length,count,prayer);
for(const node of nodes){const index=stateForAnchor(states,node.id);assert.ok(index>=0,node.id);assert.equal(states[index].anchorId,node.id);}
assert.equal(stateForAnchor(states,'cross'),0);assert.equal(stateForAnchor(states,'missing'),-1);assert.equal(edges.length,61);
const adjacency=new Map();for(const [a,b]of edges){for(const [x,y]of [[a,b],[b,a]]){if(!adjacency.has(x))adjacency.set(x,[]);adjacency.get(x).push(y);}}
const seen=new Set();function visit(id){if(seen.has(id))return;seen.add(id);for(const n of adjacency.get(id)||[])visit(n);}visit('cross');assert.equal(seen.size,61);assert.equal(adjacency.get('medal').length,3);assert.equal(adjacency.get('cross').length,1);
const map=new Map(nodes.map(n=>[n.id,n]));for(const [a,b]of edges){if(!map.has(a)||!map.has(b))continue;const na=map.get(a),nb=map.get(b);const result=connector(na.position,nb.position,beadRadius(na.kind),beadRadius(nb.kind));assert.ok(result.length>0,`overlap ${a} ${b}`);assert.ok([...result.start,...result.end,result.length].every(Number.isFinite));assert.ok(result.count>=1);assert.ok(Math.abs(Math.hypot(...result.end.map((v,i)=>v-result.start[i]))-result.length)<1e-10);}
for(let d=0;d<5;d++){const part=states.filter(s=>s.decade===d);assert.equal(part.length,13);assert.equal(part[0].prayerKey,'mystery');assert.equal(part[1].prayerKey,'our');assert.equal(part.at(-1).prayerKey,'glory');}
console.log('Rosary: complete prayer order, all 59 bead mappings, 61-edge connected topology and positive bead clearance verified.');
