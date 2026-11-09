/** Standard five-decade rosary: 50 + 4 loop beads, five opening-strand beads. */
export function rosaryLayout(){
 const nodes=[];
 for(let decade=0;decade<5;decade++){
  for(let prayer=1;prayer<=10;prayer++)nodes.push({kind:'hail',decade,step:prayer});
  if(decade<4)nodes.push({kind:'our',decade:decade+1,step:0});
 }
 const gaps=nodes.slice(1).map((node,i)=>node.kind==='our'||nodes[i].kind==='our'?1.75:1),total=gaps.reduce((a,b)=>a+b,0);let traveled=0;
 nodes.forEach((node,i)=>{if(i)traveled+=gaps[i-1];const t=.13+traveled/total*(Math.PI*2-.26);node.position=[1.6*Math.sin(t),1.2-1.9*Math.cos(t),.06+Math.sin(t*3)*.018];});
 nodes.push({kind:'our',decade:0,step:0,position:[0,-1.28,.04]},
  {kind:'hail',opening:true,position:[0,-1.72,.04]},
  {kind:'hail',opening:true,position:[0,-2.04,.04]},
  {kind:'hail',opening:true,position:[0,-2.36,.04]},
  {kind:'our',opening:true,position:[0,-2.82,.04]});
 return nodes;
}
