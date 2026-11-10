import * as THREE from 'three';
import { rosaryLayout, rosaryEdges, beadRadius, connector } from './rosary-layout.mjs';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
function build(stage){
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{return;}
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(36,1,.1,50);camera.position.set(0,-.1,10.8);
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.04);scene.environment=environment.texture;room.dispose();pmrem.dispose();
 const group=new THREE.Group();group.rotation.set(.12,-.13,-.13);scene.add(group);
 const gold=new THREE.MeshPhysicalMaterial({color:0xc9a657,metalness:1,roughness:.25,clearcoat:.5});
 const blue=new THREE.MeshPhysicalMaterial({color:0x064cb8,metalness:0,roughness:.22,clearcoat:.85,clearcoatRoughness:.1});
 const wood=new THREE.MeshPhysicalMaterial({color:0x704326,metalness:0,roughness:.62,clearcoat:.12});
 const crystal=new THREE.MeshPhysicalMaterial({color:0xdceaff,metalness:0,roughness:.1,transmission:.75,thickness:.15,ior:1.5,attenuationColor:0x0754c9,attenuationDistance:.28});
 const materials={cobalt:blue,wood,crystal};let materialName='cobalt';
 const beadGeometry=new THREE.SphereGeometry(1,24,16),beads=[],nodes=rosaryLayout(),points=nodes.map(n=>new THREE.Vector3(...n.position));
 nodes.forEach((node,i)=>{const bead=new THREE.Mesh(beadGeometry,node.kind==='our'?gold:blue);bead.position.copy(points[i]);bead.scale.setScalar(beadRadius(node.kind));bead.castShadow=true;bead.receiveShadow=true;bead.userData.index=i;bead.userData.anchorId=node.id;group.add(bead);beads.push(bead);});
 // The loop meets the medal at both ends; the five-bead strand continues to the cross.
 const positions=new Map(nodes.map(n=>[n.id,n.position]));positions.set('medal',[0,-.94,.04]);positions.set('cross',[0,-3.52,.04]);
 // The chain attaches to the top bail; prayer selection belongs to the cross itself.
 const attachmentPositions=new Map(positions);attachmentPositions.set('cross',[0,-3.08,.04]);
 const radii=new Map(nodes.map(n=>[n.id,beadRadius(n.kind)]));radii.set('medal',.16);radii.set('cross',.035);
 const joins=rosaryEdges(nodes).map(([a,b])=>connector(attachmentPositions.get(a),attachmentPositions.get(b),radii.get(a),radii.get(b)));
 const linkGeometry=new THREE.TorusGeometry(.022,.005,6,12);linkGeometry.scale(1,1.5,1);
 const rings=new THREE.InstancedMesh(linkGeometry,gold,joins.reduce((n,j)=>n+j.count,0));let ringIndex=0;const dummy=new THREE.Object3D(),axis=new THREE.Vector3(0,1,0);
 joins.forEach(join=>{const a=new THREE.Vector3(...join.start),b=new THREE.Vector3(...join.end),v=b.clone().sub(a).normalize(),q=new THREE.Quaternion().setFromUnitVectors(axis,v);for(let j=0;j<join.count;j++){dummy.position.copy(a).lerp(b,(j+.5)/join.count);dummy.quaternion.copy(q);dummy.rotateY(j%2*Math.PI/2);dummy.scale.set(1,Math.max(.5,join.length/join.count/.044),1);dummy.updateMatrix();rings.setMatrixAt(ringIndex++,dummy.matrix);}});rings.castShadow=true;group.add(rings);
 const eyeletGeometry=new THREE.TorusGeometry(.031,.007,8,20);[[0,-3.105,.04],[-.085,-.82,.04],[.085,-.82,.04],[0,-1.08,.04]].forEach(p=>{const eyelet=new THREE.Mesh(eyeletGeometry,gold);eyelet.position.set(...p);group.add(eyelet);});
 const medal=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.07,48),gold);medal.rotation.x=Math.PI/2;medal.position.set(0,-.94,.05);medal.scale.x=.8;medal.castShadow=true;group.add(medal);
 const edge=new THREE.Mesh(new THREE.TorusGeometry(.145,.008,8,48),gold);edge.scale.set(.8,1,1);edge.position.set(0,-.94,.105);group.add(edge);
 const crossShape=new THREE.Shape();const pts=[[-.065,.38],[.065,.38],[.065,.14],[.25,.14],[.25,.015],[.065,.015],[.065,-.4],[-.065,-.4],[-.065,.015],[-.25,.015],[-.25,.14],[-.065,.14]];pts.forEach(([x,y],i)=>i?crossShape.lineTo(x,y):crossShape.moveTo(x,y));crossShape.closePath();
 const cross=new THREE.Mesh(new THREE.ExtrudeGeometry(crossShape,{depth:.055,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:3,steps:1}),gold);cross.position.set(0,-3.52,.04);cross.castShadow=true;cross.userData.anchorId="cross";group.add(cross);medal.userData.anchorId="medal";
 // Capture only the physical rosary, before adding the large shadow receiver.
 // The margin also contains the selection ring and the restrained pointer tilt.
 group.updateMatrixWorld(true);
 const fitBounds=new THREE.Box3().setFromObject(group).expandByScalar(.25);
 const fitSize=fitBounds.getSize(new THREE.Vector3()),fitCenter=fitBounds.getCenter(new THREE.Vector3());
 const backing=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.12}));backing.position.z=-.17;backing.receiveShadow=true;group.add(backing);
 scene.add(new THREE.HemisphereLight(0xffffff,0x0047bb,.35));const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(-4,6,7);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.0002;key.shadow.normalBias=.003;key.shadow.radius=4;scene.add(key);const rim=new THREE.DirectionalLight(0xffffff,.5);rim.position.set(3,-1,4);scene.add(rim);
 const canvas=renderer.domElement;canvas.setAttribute('aria-hidden','true');stage.append(canvas);stage.classList.add('is-rendered');
 const resize=()=>{const r=stage.getBoundingClientRect();const height=Math.max(1,r.height),width=Math.max(1,r.width);renderer.setSize(width,height);camera.aspect=width/height;const halfFov=Math.tan(THREE.MathUtils.degToRad(camera.fov)/2),distance=Math.max(fitSize.y/(2*halfFov),fitSize.x/(2*halfFov*camera.aspect))+fitSize.z/2;camera.position.set(fitCenter.x,fitCenter.y,fitCenter.z+distance);camera.updateProjectionMatrix();render();};
 let visible=true,frame=0,targetX=.12,targetY=-.13;
 const render=()=>{if(visible&&!document.hidden)renderer.render(scene,camera);};
 const marker=new THREE.Mesh(new THREE.TorusGeometry(.16,.013,8,40),new THREE.MeshBasicMaterial({color:0x0047bb}));marker.visible=false;group.add(marker);
 function update(event){if(stage.dataset.rosaryStage!=='reader')return;const state=event.detail;let anchor=state.anchorId,p;
 if(anchor==='opening-glory')p=[0,-1.51,.14];else if(anchor.endsWith('-glory')){const decade=Number(anchor.split('-')[1]);const node=nodes.find(n=>n.id===`decade-${decade}-hail-10`);p=node.position;}else p=positions.get(anchor);
 marker.visible=!!p;if(p){marker.position.set(p[0],p[1],p[2]+.13);const n=nodes.find(n=>n.id===anchor);marker.scale.setScalar(n&&n.kind==='hail'?.65:anchor==='cross'?1.5:1);}render();}
 function changeMaterial(event){if(!materials[event.detail.material])return;materialName=event.detail.material;beads.forEach((b,i)=>{b.material=nodes[i].kind==='our'?gold:materials[materialName];});render();}
 stage.addEventListener('pointermove',e=>{if(reduced.matches||e.pointerType==='touch')return;const r=stage.getBoundingClientRect();targetY=-.13+(e.clientX-r.left-r.width/2)/r.width*.22;targetX=.12+(e.clientY-r.top-r.height/2)/r.height*.15;request();});
 stage.addEventListener('pointerleave',()=>{if(reduced.matches)return;targetX=.12;targetY=-.13;request();});
 function animate(){frame=0;if(!visible||document.hidden)return;group.rotation.x+=(targetX-group.rotation.x)*.12;group.rotation.y+=(targetY-group.rotation.y)*.12;render();if(Math.abs(targetX-group.rotation.x)+Math.abs(targetY-group.rotation.y)>.001)request();}
 function request(){if(!frame)frame=requestAnimationFrame(animate);}
 const raycaster=new THREE.Raycaster();let pointerStart=null;
 stage.addEventListener('pointerdown',e=>{pointerStart={x:e.clientX,y:e.clientY};});
 stage.addEventListener('pointerup',e=>{if(stage.dataset.rosaryStage!=='reader'||!pointerStart||Math.hypot(e.clientX-pointerStart.x,e.clientY-pointerStart.y)>8)return;pointerStart=null;const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);const hit=raycaster.intersectObjects([...beads,cross,medal])[0];if(hit)document.dispatchEvent(new CustomEvent('fr-rosary-select',{detail:{anchorId:hit.object.userData.anchorId}}));});
 const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(stage);const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){render();request();}else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:.05});visibilityObserver.observe(stage);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){render();request();}});document.addEventListener('fr-rosary-state',update);document.addEventListener('fr-rosary-material',changeMaterial);reduced.addEventListener('change',()=>{targetX=.12;targetY=-.13;group.rotation.set(.12,-.13,-.13);if(frame)cancelAnimationFrame(frame);frame=0;render();});resize();document.dispatchEvent(new CustomEvent('fr-rosary-ready'));
 window.addEventListener('pagehide',event=>{if(event.persisted)return;sizeObserver.disconnect();visibilityObserver.disconnect();if(frame)cancelAnimationFrame(frame);document.removeEventListener('fr-rosary-state',update);document.removeEventListener('fr-rosary-material',changeMaterial);const geometries=new Set(),ownedMaterials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const material of [].concat(object.material||[]))ownedMaterials.add(material);});geometries.forEach(g=>g.dispose());ownedMaterials.forEach(m=>m.dispose());Object.values(materials).forEach(m=>m.dispose());environment.dispose();renderer.dispose();},{once:true});
}
document.querySelectorAll('[data-rosary-stage]').forEach(build);
