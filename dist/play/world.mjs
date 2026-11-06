import * as T from './vendor/three.module.js';
import {SoftwareRenderer} from './software.mjs';
export {T};
export const sites={teni:{x:-10,z:29,label:'Teni',kind:'person',color:'#f4cf82'},market:{x:20,z:29,label:'Bisi’s market',kind:'person',color:'#f4cf82'},station:{x:-22,z:32,label:'Substation',kind:'station',color:'#a7ff9c'},council:{x:21,z:-12,label:'Council records',kind:'evidence',color:'#f4cf82'},board:{x:-12,z:22,label:'Feeder controls',kind:'switch',color:'#a7ff9c'},square:{x:0,z:-43,label:'Community square',kind:'finish',color:'#a7ff9c'},clinic:{x:-21,z:-12,label:'Clinic',kind:'person',color:'#e3f0d5'},musa:{x:12,z:45,label:'Musa',kind:'person',color:'#e3f0d5'}};
export function buildWorld(canvas){
 let renderer;try{renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});}catch{renderer=new SoftwareRenderer(canvas);}renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;renderer.outputColorSpace=T.SRGBColorSpace;
 const scene=new T.Scene();scene.background=new T.Color('#d8bd9a');scene.fog=new T.Fog('#d8bd9a',62,165);const camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,.15,210);
 scene.add(new T.HemisphereLight('#c1d4e4','#826849',2.1));const sun=new T.DirectionalLight('#ffddb0',3.2);sun.position.set(-40,55,35);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:1,far:180});sun.shadow.bias=-.0003;sun.shadow.normalBias=.07;scene.add(sun);
 const batches=new Map(),unit=new T.BoxGeometry(1,1,1),dummy=new T.Object3D(),colliders=[],occluders=[],lights=[],people=[],vehicles=[];let seed=1809;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.92,metalness:0,...extra});
 const m={earth:mat('#b59b73'),pavement:mat('#c3baa4'),road:mat('#5d615c'),white:mat('#f1ead7'),wood:mat('#654632'),dark:mat('#273c35'),roof:mat('#5a5141',{metalness:.18}),redRoof:mat('#8e5239',{metalness:.12}),greenRoof:mat('#3f6252',{metalness:.15}),glass:mat('#314b49',{roughness:.3,metalness:.15}),cream:mat('#dbca9f'),yellow:mat('#d4b270'),blue:mat('#71958a'),rose:mat('#b88770'),leaf:mat('#52714b'),leaf2:mat('#718155'),trunk:mat('#70523a'),metal:mat('#67776d',{metalness:.6,roughness:.6}),mint:mat('#badf9c'),orange:mat('#c86d3c'),black:mat('#242b29'),bus:mat('#d5a534'),paper:mat('#e5d9ad'),red:mat('#b54e3d')};
 function texture(type){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');g.fillStyle=type==='road'?'#747772':type==='earth'?'#c5b18b':'#c9bba0';g.fillRect(0,0,256,256);for(let i=0;i<2600;i++){g.fillStyle=rand()>.5?'#ffffff0d':'#0000000b';g.fillRect(rand()*256,rand()*256,rand()*4+1,rand()*4+1);}if(type==='earth'){g.strokeStyle='#98856233';for(let i=0;i<18;i++){g.beginPath();g.moveTo(rand()*256,rand()*256);g.lineTo(rand()*256,rand()*256);g.stroke();}}const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(type==='road'?12:24,type==='road'?12:24);return t;}
 m.earth.map=texture('earth');m.road.map=texture('road');
 function b(w,h,d,x,y,z,material=m.cream,ry=0){if(!batches.has(material))batches.set(material,[]);dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(w,h,d);dummy.updateMatrix();batches.get(material).push(dummy.matrix.clone());}
 function mesh(geo,material,x=0,y=0,z=0,parent=scene){const o=new T.Mesh(geo,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 function cyl(r1,r2,h,x,y,z,material,segments=10,parent=scene){return mesh(new T.CylinderGeometry(r1,r2,h,segments),material,x,y,z,parent);}
 function sign(text,x,y,z,w=5,h=.9,bg='#253f36',fg='#f4ead2',ry=0){const c=document.createElement('canvas');c.width=768;c.height=128;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,768,128);g.fillStyle=fg;g.font='bold 55px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,384,66,730);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:t,roughness:1}),x,y,z);o.rotation.y=ry;return o;}
 b(180,.2,180,0,-.16,0,m.earth);b(13,.15,150,0,-.02,0,m.road);b(120,.15,13,0,-.01,0,m.road);
 for(const x of [-8,8])b(2.6,.22,150,x,.05,0,m.pavement);for(const z of [-8,8])b(120,.22,2.6,0,.05,z,m.pavement);
 for(let z=-65;z<68;z+=8)if(Math.abs(z)>8)b(.15,.02,3,0,.08,z,m.white);for(let x=-53;x<56;x+=8)if(Math.abs(x)>8)b(3,.02,.15,x,.09,0,m.white);
 // Roadside drainage and concrete crossing slabs.
 for(const x of [-10,10]){b(.6,.08,145,x,-.03,0,m.dark);for(let z=-64;z<=64;z+=8)b(.8,.12,2,x,.12,z,m.pavement);}
 function building(x,z,w,d,h,material,roof=m.redRoof,title='',floors=1){
  b(w,h,d,x,h/2,z,material);colliders.push({x,z,w:w+.2,d:d+.2});const o=mesh(new T.BoxGeometry(w,h,d),m.cream,x,h/2,z);o.visible=false;occluders.push(o);
  b(w+.7,.2,d+.8,x,h+.12,z,roof);b(w+.4,.16,.23,x,h+.28,z+d/2+.35,m.wood);
  // Corrugated ridges and foundation paint.
  for(let xx=x-w/2;xx<x+w/2;xx+=.65)b(.035,.06,d+.7,xx,h+.25,z,roof);
  b(w,.65,.08,x,.5,z+d/2+.05,m.dark);b(w,.12,.12,x,h-.7,z+d/2+.07,m.white);
  for(let floor=0;floor<floors;floor++)for(let xx=x-w/2+1.7;xx<x+w/2-.7;xx+=3.1){
   if(Math.abs(xx-x)<1.3&&floor===0)continue;const yy=1.8+floor*2.8;b(1.3,1.6,.1,xx,yy,z+d/2+.08,m.white);b(1.08,1.35,.13,xx,yy,z+d/2+.15,m.glass);for(let k=-1;k<=1;k++)b(.035,1.3,.16,xx+k*.33,yy,z+d/2+.24,m.dark);b(1.2,.04,.16,xx,yy,z+d/2+.24,m.dark);
   const glow=new T.MeshBasicMaterial({color:'#f4ce78',transparent:true,opacity:.04});const l=mesh(new T.PlaneGeometry(.95,1.2),glow,xx,yy,z+d/2+.24);lights.push({material:glow,mesh:l,site:title});
  }
  b(1.4,2.45,.15,x,1.25,z+d/2+.15,m.wood);b(.09,.12,.1,x+.45,1.1,z+d/2+.28,m.paper);b(2.8,.16,1.2,x,.16,z+d/2+.6,m.pavement);
  if(title)sign(title,x,h-.75,z+d/2+.18,Math.min(w-1,8),1.1);
  // Rooftop water tank and television aerial.
  if(h>5){b(2.8,.15,2.8,x+w*.25,h+.4,z-1,m.dark);cyl(1,1,1.5,x+w*.25,h+1.2,z-1,m.black);b(.05,2.7,.05,x-w*.3,h+1.3,z,m.metal);b(1.5,.04,.04,x-w*.3,h+2.5,z,m.metal);}
 }
 building(-22,-23,19,14,6.3,m.cream,m.greenRoof,'NADABI CLINIC',2);
 building(21,-24,20,16,6.8,m.yellow,m.greenRoof,'COMMUNITY COUNCIL',2);
 // Council entrance pillars and public noticeboard.
 for(const x of [14,28]){b(.55,3.5,.55,x,1.75,-14.8,m.white);b(1,.2,1,x,3.5,-14.8,m.white);}b(16,.3,2.4,21,3.7,-15,m.cream);
 b(2.5,2.5,.25,21,1.7,-12.4,m.wood);sign('PUBLIC NOTICE',21,2.5,-12.23,2.3,.45,'#c4b78e','#233b30');sign('FEEDER 04 / COUNCIL',21,1.65,-12.22,2.1,.5,'#e4d8b5','#273b31');
 building(-24,24,14,10,3.6,m.blue,m.roof,'NADABI POWER');
 // Substation yard: three transformer cabinets, insulators, safe perimeter.
 for(const x of [-29,-25,-21]){b(2.5,2.2,2.4,x,1.3,15,m.metal);for(let k=0;k<6;k++)b(2.65,.05,2.5,x,.6+k*.3,15,m.dark);for(const xx of [-.7,.7]){cyl(.18,.18,.6,x+xx,2.8,15,m.paper);cyl(.3,.3,.15,x+xx,2.8,15,m.wood);}}
 for(const x of [-32,-17]){b(.13,2.5,10,x,1.25,15,m.metal);colliders.push({x,z:15,w:.3,d:10});}b(15,2.5,.14,-24.5,1.25,10,m.metal);colliders.push({x:-24.5,z:10,w:15,d:.3});
 // Feeder switches, an interactive object outside the fence.
 b(.25,2.6,2.2,-12.5,1.3,22,m.dark);b(.4,1.5,1.6,-12.2,1.8,22,m.metal);for(let i=0;i<3;i++){b(.08,.2,.25,-11.95,1.4+i*.4,22,m.mint);}sign('FEEDER',-12.2,2.9,23.15,2,.5);
 building(22,21,19,13,4,m.rose,m.redRoof,'BISI & SONS');
 const awnings=[m.orange,m.greenRoof,m.yellow];for(let i=0;i<3;i++){const xx=15+i*6;b(5.6,.15,4.5,xx,3.05,29,awnings[i]);for(const dx of [-2.3,2.3])b(.1,3,.1,xx+dx,1.5,30.5,m.wood);b(4.4,.25,1.5,xx,.95,29.8,m.wood);for(let j=0;j<8;j++){const fruitMat=j%2?m.orange:m.mint;cyl(.22,.24,.25,xx-1.6+j*.42,1.23,29.6,fruitMat,6);}b(1.5,.7,1.2,xx,.35,32,m.wood);}
 // Fuse on counter. Removed when acquired.
 const fuse=mesh(new T.BoxGeometry(.7,.28,.35),m.mint,20,1.2,30.4);cyl(.18,.18,.7,20,1.43,30.4,m.metal,10);
 building(-23,49,20,14,6.2,m.cream,m.redRoof,'',2);building(24,49,19,14,6.3,m.yellow,m.greenRoof,'',2);building(-24,-49,22,15,6.2,m.rose,m.roof,'',2);building(27,-49,18,15,6.2,m.blue,m.redRoof,'',2);
 for(const x of [-48,48])for(const z of [-45,-19,20,48])building(x,z,15,13,3.7,[m.cream,m.yellow,m.rose][Math.floor(rand()*3)],m.redRoof);
 // Square with a platform, benches and a neighbourhood sign.
 b(12,.3,8,0,.12,-44,m.pavement);b(5,.55,2.5,0,.45,-46,m.wood);for(const x of [-3.2,3.2]){b(.12,4,.12,x,2,-47,m.wood);}sign('NADABI',0,3.6,-47,7,1.25);sign('OUR STREET. OUR SAY.',0,2.4,-46.95,5,.65,'#e0c28d','#293f32');
 for(const z of [-38,-50])for(const x of [-5,5]){b(3,.2,.65,x,.7,z,m.wood);b(3,.7,.15,x,1,z-.35,m.wood);for(const dx of [-1.1,1.1])b(.15,.6,.5,x+dx,.3,z,m.dark);}
 function tree(x,z,palm=false){cyl(.17,.33,palm?8:4,x,palm?4:2,z,m.trunk,7);if(palm){for(let i=0;i<7;i++){const leaf=mesh(new T.SphereGeometry(1,6,4),m.leaf,x,7.5,z);leaf.scale.set(.55,.2,3.4);leaf.rotation.set(.2,i*Math.PI*2/7,.15);leaf.position.x+=Math.sin(i*Math.PI*2/7)*1.5;leaf.position.z+=Math.cos(i*Math.PI*2/7)*1.5;}}else {for(let i=0;i<3;i++){const o=mesh(new T.IcosahedronGeometry(2.2,1),i%2?m.leaf:m.leaf2,x+(i-1)*1.2,4+i*.6,z+(i%2)*.6);o.scale.y=1.1;}}colliders.push({x,z,w:.7,d:.7});}
 for(const [x,z,palm] of [[-11,-38,1],[12,13,1],[33,33,1],[-35,35,0],[-12,48,1],[36,-11,0],[37,-35,1],[-35,-10,0],[-34,-38,1],[10,-57,1],[-40,0,0],[50,0,1]])tree(x,z,palm);
 // Street poles and actual overhead cables.
 for(const x of [-9.7,9.7])for(let z=-60;z<65;z+=24){cyl(.14,.2,8.2,x,4.1,z,m.trunk,7);b(2.3,.1,.1,x,7.9,z,m.wood);for(const dx of [-.8,.8]){const points=[];for(let j=0;j<=12;j++)points.push(new T.Vector3(x+dx,7.9-Math.sin(j/12*Math.PI)*.8,z+j*2));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#35382e'})));}const lampMat=new T.MeshBasicMaterial({color:'#f8dba2'});const lamp=mesh(new T.BoxGeometry(.6,.1,.4),lampMat,x,7.2,z+1);lights.push({material:lampMat,mesh:lamp,street:true});}
 // Concrete walls, posters and roadside furniture.
 for(const x of [-64,64]){b(.4,2.8,145,x,1.4,0,m.cream);colliders.push({x,z:0,w:.4,d:145});}for(const z of [-70,70]){b(128,2.8,.4,0,1.4,z,m.cream);colliders.push({x:0,z,w:128,d:.4});}
 for(let i=0;i<10;i++){const x=i%2?-8:8,z=-60+i*12;const bin=cyl(.32,.4,.8,x,.4,z,m.dark,10);b(.7,.08,.7,x,.85,z,m.metal);}
 for(const x of [-22,22]){sign('KEEP NADABI CLEAN',x,1.4,57.1,4.4,.6,'#d7d0ac','#33473a');}
 // Distant city roofline.
 for(let i=0;i<32;i++){const angle=i/32*Math.PI*2,dist=90+rand()*20,h=6+rand()*16;b(8+rand()*8,h,8+rand()*7,Math.sin(angle)*dist,h/2,Math.cos(angle)*dist,rand()>.5?m.cream:m.blue);}
 function person(x,z,shirt='#d4a658',skirt=false){const g=new T.Group();g.position.set(x,0,z);scene.add(g);const skin=mat('#714b33'),cloth=mat(shirt),trouser=mat('#344a46'),shoe=mat('#292b27');const body=mesh(new T.CylinderGeometry(.26,.29,.65,8),cloth,0,1.08,0,g);body.scale.z=.72;const head=mesh(new T.SphereGeometry(.205,12,10),skin,0,1.65,0,g);head.scale.y=1.13;mesh(new T.SphereGeometry(.21,10,8),m.black,0,1.76,-.02,g).scale.set(1,.55,1);mesh(new T.SphereGeometry(.045,6,5),skin,0,1.65,.19,g);const limbs=[];for(const side of [-1,1]){const leg=new T.Group();leg.position.set(side*.15,.78,0);g.add(leg);mesh(new T.CylinderGeometry(.105,.09,.7,7),trouser,0,-.35,0,leg);mesh(new T.BoxGeometry(.2,.12,.33),shoe,0,-.7,.06,leg);limbs.push(leg);const arm=new T.Group();arm.position.set(side*.34,1.35,0);g.add(arm);mesh(new T.CylinderGeometry(.09,.075,.55,7),cloth,0,-.22,0,arm);mesh(new T.SphereGeometry(.085,7,6),skin,0,-.53,0,arm);limbs.push(arm);}if(skirt)cyl(.27,.42,.62,0,.7,0,cloth,9,g);return {group:g,limbs,body,head,phase:rand()*6};}
 const player=person(0,31,'#e4dbbd');const contactShadow=mesh(new T.CircleGeometry(.42,16),new T.MeshBasicMaterial({color:'#17291e',transparent:true,opacity:.24,depthWrite:false}),0,.015,0,player.group);contactShadow.rotation.x=-Math.PI/2;contactShadow.castShadow=false;const backpack=mesh(new T.BoxGeometry(.4,.5,.2),m.greenRoof,0,1.15,-.22,player.group);player.group.rotation.y=Math.PI;
 const actors={teni:person(-10,29,'#497a8c'),market:person(20,29,'#ba704c',true),clinic:person(-21,-12,'#e7e5d4',true),musa:person(12,45,'#d4a658'),dairo:person(24,-13,'#f0ddba')};for(const a of Object.values(actors))a.group.rotation.y=Math.PI*.15;
 const guard=person(13,-12,'#414e55');
 for(let i=0;i<10;i++){const x=i%2?-7.5:7.5,z=-55+rand()*110;const a=person(x,z,['#9a6249','#d7be82','#6e8c7b','#668697'][i%4],i%3===0);a.speed=.45+rand()*.5;a.direction=i%2?1:-1;a.pathX=x;people.push(a);}
 for(let i=0;i<5;i++){const a=person(-4+i*2,-40+(i%2)*2,['#aa6e4b','#c3b48d','#769686'][i%3],i%2===0);people.push({...a,speed:0});}
 function van(x,z){const g=new T.Group();g.position.set(x,0,z);scene.add(g);mesh(new T.BoxGeometry(2.35,1.55,4.6),m.bus,0,1.35,0,g);mesh(new T.BoxGeometry(2.25,.8,4.2),m.bus,0,2.35,0,g);mesh(new T.BoxGeometry(2.3,.55,.03),m.glass,0,2.35,2.12,g);mesh(new T.BoxGeometry(2.3,.55,.03),m.glass,0,2.35,-2.12,g);for(const side of [-1,1]){mesh(new T.BoxGeometry(.04,.08,4.6),m.black,side*1.2,1.5,0,g);for(let j=0;j<3;j++)mesh(new T.BoxGeometry(.04,.55,.8),m.glass,side*1.17,2.35,j*1.1-1.1,g);for(const zz of [-1.5,1.5]){const wheel=mesh(new T.CylinderGeometry(.4,.4,.25,12),m.black,side*1.17,.5,zz,g);wheel.rotation.z=Math.PI/2;}}return g;}
 vehicles.push({group:van(3,-55),speed:2.8,direction:1});const parked=van(34,31);parked.rotation.y=Math.PI/2;colliders.push({x:34,z:31,w:4.8,d:2.5});
 // Small landmark markers belong to the world, not menu tiles.
 const rings={};for(const [id,p] of Object.entries(sites)){const geo=new T.RingGeometry(.65,.82,32),material=new T.MeshBasicMaterial({color:p.color,side:T.DoubleSide,transparent:true,opacity:.7});const ring=mesh(geo,material,p.x,.07,p.z);ring.rotation.x=-Math.PI/2;ring.castShadow=false;rings[id]=ring;}
 for(const [material,matrices] of batches){const inst=new T.InstancedMesh(unit,material,matrices.length);matrices.forEach((matrix,i)=>inst.setMatrixAt(i,matrix));inst.castShadow=true;inst.receiveShadow=true;scene.add(inst);}
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}resize();addEventListener('resize',resize);
 return {renderer,scene,camera,sun,player,actors,guard,people,vehicles,colliders,occluders,lights,rings,fuse,m,person,resize};
}
