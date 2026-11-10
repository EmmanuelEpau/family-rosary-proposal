export const beadRadius = kind => kind==='our'?.125:.074;
/** 50 small + four large loop beads; five pendant beads. Cross/medal are fittings. */
export function rosaryLayout(){
 const nodes=[];
 for(let decade=0;decade<5;decade++){
  for(let prayer=1;prayer<=10;prayer++)nodes.push({id:`decade-${decade+1}-hail-${prayer}`,kind:'hail',decade,step:prayer});
  if(decade<4)nodes.push({id:`decade-${decade+2}-our`,kind:'our',decade:decade+1,step:0});
 }
 const gaps=nodes.slice(1).map((node,i)=>node.kind==='our'||nodes[i].kind==='our'?1.75:1),total=gaps.reduce((a,b)=>a+b,0);let traveled=0;
 nodes.forEach((node,i)=>{if(i)traveled+=gaps[i-1];const t=.13+traveled/total*(Math.PI*2-.26);node.position=[1.6*Math.sin(t),1.2-1.9*Math.cos(t),.06+Math.sin(t*3)*.018];});
 nodes.push({id:'decade-1-our',kind:'our',decade:0,step:0,position:[0,-1.28,.04]},
  {id:'opening-hail-3',kind:'hail',opening:true,position:[0,-1.72,.04]},
  {id:'opening-hail-2',kind:'hail',opening:true,position:[0,-2.04,.04]},
  {id:'opening-hail-1',kind:'hail',opening:true,position:[0,-2.36,.04]},
  {id:'opening-our',kind:'our',opening:true,position:[0,-2.82,.04]});
 return nodes;
}
export function rosaryEdges(nodes=rosaryLayout()){
 const edges=[];for(let i=0;i<53;i++)edges.push([nodes[i].id,nodes[i+1].id]);
 edges.push([nodes[0].id,'medal'],[nodes[53].id,'medal'],['medal',nodes[54].id]);
 for(let i=54;i<58;i++)edges.push([nodes[i].id,nodes[i+1].id]);edges.push([nodes[58].id,'cross']);return edges;
}
/** Surface-trimmed connector; rings fit the exposed distance, not bead centres. */
export function connector(a,b,ra=0,rb=0){
 const d=b.map((v,i)=>v-a[i]),distance=Math.hypot(...d),unit=d.map(v=>v/distance),length=Math.max(0,distance-ra-rb);
 return {start:a.map((v,i)=>v+unit[i]*ra),end:b.map((v,i)=>v-unit[i]*rb),length,count:Math.max(1,Math.ceil(length/.045))};
}
