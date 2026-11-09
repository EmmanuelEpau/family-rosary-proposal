import assert from 'node:assert/strict';
import {rosaryLayout} from '../src/rosary-layout.mjs';
const beads=rosaryLayout();assert.equal(beads.length,59);assert.equal(beads.filter(x=>x.kind==='hail').length,53);assert.equal(beads.filter(x=>x.kind==='our').length,6);
assert.deepEqual(beads.slice(54).reverse().map(x=>x.kind),['our','hail','hail','hail','our']);
for(let n=0;n<5;n++){const decade=beads.filter(x=>!x.opening&&x.decade===n);assert.equal(decade.length,11);assert.deepEqual(decade.map(x=>x.step).sort((a,b)=>a-b),Array.from({length:11},(_,i)=>i));}
assert.equal(beads.slice(0,54).filter(x=>x.kind==='our').length,4);
console.log('Rosary structure:59 beads; cross-to-medal1/3/1; five complete decades;53 HailMary and6 OurFather beads');
