import * as THREE from 'three';
import { rosaryLayout } from './rosary-layout.mjs';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function build(stage){
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return;}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50);camera.position.set(0,-.1,10.8);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromScene(new RoomEnvironment(),.04);scene.environment=environment.texture;pmrem.dispose();
 const group=new THREE.Group();group.rotation.set(.12,-.13,-.13);scene.add(group);
 const gold=new THREE.MeshPhysicalMaterial({color:0xc9a657,metalness:1,roughness:.25,clearcoat:.5});
 const blue=new THREE.MeshPhysicalMaterial({color:0x0047bb,metalness:.15,roughness:.18,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.0});
 const beadGeometry=new THREE.SphereGeometry(1,32,24),beads=[],nodes=rosaryLayout(),points=nodes.map(n=>new THREE.Vector3(...n.position));
 nodes.forEach((node,i)=>{const bead=new THREE.Mesh(beadGeometry,(node.kind==='our'?gold:blue).clone());bead.position.copy(points[i]);bead.scale.setScalar(node.kind==='our'?.125:.088);bead.castShadow=true;bead.receiveShadow=true;bead.userData.index=i;group.add(bead);beads.push(bead);});
 // The loop meets the medal at both ends; the five-bead strand continues to the cross.
 const joins=[];for(let i=0;i<53;i++)joins.push([points[i],points[i+1]]);const medalPoint=new THREE.Vector3(0,-.94,0);joins.push([points[0],medalPoint],[points[53],medalPoint],[medalPoint,points[54]]);for(let i=54;i<58;i++)joins.push([points[i],points[i+1]]);joins.push([points[58],new THREE.Vector3(0,-3.14,.04)]);
 const rings=new THREE.InstancedMesh(new THREE.TorusGeometry(.033,.007,6,14),gold,joins.length*4);let ringIndex=0;const dummy=new THREE.Object3D();joins.forEach(([a,b])=>{const v=b.clone().sub(a);for(let j=0;j<4;j++){dummy.position.copy(a).lerp(b,(j+1)/5);dummy.rotation.set(j%2*Math.PI/2,0,Math.atan2(v.y,v.x)-Math.PI/2);dummy.scale.set(1,1.3,1);dummy.updateMatrix();rings.setMatrixAt(ringIndex++,dummy.matrix);}});rings.castShadow=true;group.add(rings);
 const medal=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.07,48),gold);medal.rotation.x=Math.PI/2;medal.position.set(0,-.94,.05);medal.scale.x=.8;medal.castShadow=true;group.add(medal);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(.128,.014,8,48),gold);edge.scale.set(.8,1,1);edge.position.set(0,-.94,.105);group.add(edge);
 const crossShape=new THREE.Shape();const pts=[[-.065,.38],[.065,.38],[.065,.14],[.25,.14],[.25,.015],[.065,.015],[.065,-.4],[-.065,-.4],[-.065,.015],[-.25,.015],[-.25,.14],[-.065,.14]];pts.forEach(([x,y],i)=>i?crossShape.lineTo(x,y):crossShape.moveTo(x,y));crossShape.closePath();
 const cross=new THREE.Mesh(new THREE.ExtrudeGeometry(crossShape,{depth:.055,bevelEnabled:true,bevelSize:.018,bevelThickness:.015,bevelSegments:3,steps:1}),gold);cross.position.set(0,-3.52,.04);cross.castShadow=true;group.add(cross);
 const backing=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.17}));backing.position.z=-.16;backing.receiveShadow=true;scene.add(backing);
 scene.add(new THREE.HemisphereLight(0xffffff,0x0047bb,.8));const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-4,6,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.001;key.shadow.normalBias=.02;key.shadow.radius=4;scene.add(key);const rim=new THREE.DirectionalLight(0x91caff,1.3);rim.position.set(3,-1,4);scene.add(rim);
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');stage.append(canvas);stage.classList.add('is-rendered');
 const resize=()=>{const r=stage.getBoundingClientRect();const height=r.height-(stage.dataset.rosaryStage==='intro'?140:0);renderer.setSize(r.width,height);camera.aspect=r.width/height;camera.position.z=r.width/height<.8?12:10.8;camera.updateProjectionMatrix();render();};
 let active=0,visible=true,frame=0,targetX=.12,targetY=-.13;
 const render=()=>renderer.render(scene,camera);
 const update=()=>{const current=document.querySelector('[data-prayer-step][aria-current="step"]');const n=Number(document.querySelector('#mystery-number')?.value||0),step=Number(current?.dataset.prayerStep||0);active=nodes.findIndex(node=>!node.opening&&node.decade===n&&node.step===Math.min(step,10));beads.forEach((b,i)=>{const selected=stage.dataset.rosaryStage==='reader'&&i===active;b.material.color.setHex(selected?0xffb500:nodes[i].kind==='our'?0xc9a657:0x0047bb);b.material.metalness=selected||nodes[i].kind==='our'?.9:.15;b.scale.setScalar(nodes[i].kind==='our'?.125:.088);if(selected)b.scale.multiplyScalar(1.24);});render();};
 stage.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=stage.getBoundingClientRect();targetY=-.13+(e.clientX-r.left-r.width/2)/r.width*.22;targetX=.12+(e.clientY-r.top-r.height/2)/r.height*.15;request();});
 stage.addEventListener('pointerleave',()=>{targetX=.12;targetY=-.13;request();});
 function animate(){frame=0;if(!visible||document.hidden)return;group.rotation.x+=(targetX-group.rotation.x)*.12;group.rotation.y+=(targetY-group.rotation.y)*.12;render();if(Math.abs(targetX-group.rotation.x)+Math.abs(targetY-group.rotation.y)>.001)request();}
 function request(){if(!frame)frame=requestAnimationFrame(animate);}
 const raycaster=new THREE.Raycaster();stage.addEventListener('pointerup',e=>{if(stage.dataset.rosaryStage!=='reader')return;const r=stage.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);const hit=raycaster.intersectObjects(beads)[0];if(!hit)return;const node=nodes[hit.object.userData.index];if(node.opening)return;const select=document.querySelector('#mystery-number');select.value=String(node.decade);select.dispatchEvent(new Event('change'));document.querySelector('[data-prayer-step="'+node.step+'"]').click();});
 new ResizeObserver(resize).observe(stage);new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)request();else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:.05}).observe(stage);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)request();});document.addEventListener('fr-prayer-change',update);resize();update();
}
document.querySelectorAll('[data-rosary-stage]').forEach(build);
