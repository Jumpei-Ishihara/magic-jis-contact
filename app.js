import * as T from 'three';
import {createSmoothMatte,prepareCapGeometry} from './key-material.js';
import {KeyMotion} from './key-motion.js';
import {installDesk} from './desk-scene.js';
import {CSS3DRenderer} from 'three/addons/renderers/CSS3DRenderer.js';
import {installMonitor} from './monitor-scene.js';
const view=document.querySelector('#view'),editor=document.querySelector('#writing'),loading=document.querySelector('#loading'),keys=new Map(),meshes=[],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let renderer,cssRenderer,scene,camera,keyboardRoot,frame=0,ready=false;
function box(w,d,h,r,wedge=false){const v=[0,wedge?24.8:h/2,0,0,wedge?1.8:-h/2,0],p=[],ix=[];for(let c=0;c<4;c++){const cx=(c<2?1:-1)*(w/2-r),cz=(c===0||c===3?-1:1)*(d/2-r),a=-Math.PI/2+c*Math.PI/2;for(let j=0;j<16;j++){const t=a+j*Math.PI/32;p.push([cx+r*Math.cos(t),cz+r*Math.sin(t)]);}}for(const up of [true,false])for(const [x,z]of p)v.push(x,wedge?(up?31.2-6.25*Math.cos(Math.PI/45)-(z+1)*Math.sin(Math.PI/45):1.8):(up?h/2:-h/2),z);for(let i=0;i<64;i++){const n=(i+1)%64;ix.push(0,2+n,2+i,1,66+i,66+n,2+i,2+n,66+i,2+n,66+n,66+i);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();return g;}
const material=color=>new T.MeshStandardMaterial({color,roughness:.94,metalness:0});function mesh(g,m,parent,pos){const o=new T.Mesh(g,m);if(pos)o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
const motion=new KeyMotion(keys,{reduced});
function diagnostics(){
 view.dataset.activeKeys=[...keys].filter(([,k])=>k.held).map(([c])=>c).join(',');
 view.dataset.keyDepths=JSON.stringify(Object.fromEntries([...keys].filter(([,k])=>Math.abs(k.depth)>.001).map(([c,k])=>[c,Number(k.depth.toFixed(3))])));
}
function animate(now){frame=0;const moving=motion.tick(now);diagnostics();renderer.render(scene,camera);cssRenderer.render(scene,camera);if(moving)frame=requestAnimationFrame(animate);}
function render(){if(ready&&!frame)frame=requestAnimationFrame(animate);}
function press(code,down,source='hardware'){
 if(motion.input(code,source,down,performance.now())){if(down)view.dataset.lastKey=code;diagnostics();render();}
}
function release(){motion.reset();diagnostics();render();}
function resize(){if(!ready)return;const w=view.clientWidth,h=view.clientHeight;renderer.setSize(w,h,false);cssRenderer.setSize(w,h);camera.aspect=w/h;camera.fov=Math.max(38,T.MathUtils.radToDeg(2*Math.atan(Math.tan(T.MathUtils.degToRad(42)/2)/camera.aspect)));camera.position.set(0,500,1250);camera.lookAt(0,260,-450);camera.updateProjectionMatrix();camera.updateMatrixWorld();if(keyboardRoot){keyboardRoot.scale.setScalar(1.2);keyboardRoot.position.z=40;keyboardRoot.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(keyboardRoot);let span=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])span=Math.max(span,Math.abs(new T.Vector3(x,y,z).project(camera).x));if(span>.98)keyboardRoot.scale.multiplyScalar(.98/span);keyboardRoot.updateMatrixWorld(true);view.dataset.keyboardScale=keyboardRoot.scale.x.toFixed(3);}render();}
try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;view.append(renderer.domElement);cssRenderer=new CSS3DRenderer();Object.assign(cssRenderer.domElement.style,{position:'absolute',inset:'0',pointerEvents:'none'});view.append(cssRenderer.domElement);scene=new T.Scene();camera=new T.PerspectiveCamera(32,1,1,5000);installDesk(renderer,scene);installMonitor(scene,document.querySelector('.writing'));
const [data,bin]=await Promise.all([fetch('./keyboard.json').then(r=>{if(!r.ok)throw Error('model');return r.json();}),fetch('./keyboard.bin').then(r=>{if(!r.ok)throw Error('mesh');return r.arrayBuffer();})]),geo=new Map();for(const [id,s]of Object.entries(data.geometries)){const g=new T.BufferGeometry();for(const [a,n]of [['vertices','position'],['normals','normal']])if(s[a])g.setAttribute(n,new T.BufferAttribute(new Float32Array(bin,s[a].offset,s[a].length),3));g.setIndex(new T.BufferAttribute(new Uint32Array(bin,s.indices.offset,s.indices.length),1));if(!s.normals)g.computeVertexNormals();geo.set(id,g);}
const cap=createSmoothMatte(renderer),body=new T.MeshStandardMaterial({color:'#a3aaa7',roughness:.5,metalness:.55,envMapIntensity:1.1}),gasket=new T.MeshStandardMaterial({color:'#636967',roughness:.95,metalness:0}),plate=new T.MeshStandardMaterial({color:'#929993',roughness:.82,metalness:.12}),ink=new T.MeshBasicMaterial({color:'#484d48',side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),root=new T.Group(),deck=new T.Group();const capPlain=cap.clone();capPlain.vertexColors=false;keyboardRoot=root;root.position.z=40;scene.add(root);deck.position.y=31.2;deck.rotation.x=T.MathUtils.degToRad(4);root.add(deck);mesh(box(745,310,14,22,true),body,root,[0,0,1]);mesh(box(735,300,1.4,19),gasket,deck,[0,-5.55,1]);mesh(box(741,306,4,21),body,deck,[0,-3.25,1]);mesh(box(725,290,2,16),plate,deck,[0,-.25,1]);
for(const k of data.keys){const group=new T.Group();group.position.set(k.x,14.25,k.z);group.scale.y=1.1;deck.add(group);let cg=geo.get(k.cap);if(!cg.hasAttribute('uv')){cg=prepareCapGeometry(cg);geo.set(k.cap,cg);}const o=mesh(cg,cap,group);o.userData.code=k.code;meshes.push(o);if(k.legend)mesh(geo.get(k.legend.geometry),ink,group);if(k.code==='TouchID'){const ring=mesh(new T.TorusGeometry(13.1,.5,8,80),material('#757e70'),group,[0,6.95,0]);ring.rotation.x=Math.PI/2;mesh(new T.CylinderGeometry(12.5,12.5,.3,64),capPlain,group,[0,6.7,0]);}if(k.code==='KeyF'||k.code==='KeyJ')mesh(new T.BoxGeometry(6,.35,1.2),capPlain,group,[-12,6.7,15]);keys.set(k.code,{group,baseY:14.25,sources:new Set(),depth:0,held:false,moving:false,from:0,to:0,start:0,duration:1,downAt:-Infinity,releaseAt:null});}
document.querySelector('.writing').classList.add('ready');ready=true;view.dataset.ready='true';view.dataset.keys=String(keys.size);view.dataset.keyMaterial='smooth';view.dataset.materialKeys=String(meshes.filter(m=>m.material===cap).length);loading.classList.add('done');resize();new ResizeObserver(resize).observe(view);editor.focus({preventScroll:true});window.addEventListener('keydown',e=>{
 if(!e.repeat)press(e.code,true);
});
window.addEventListener('keyup',e=>{
 press(e.code,false);
 // macOS can suppress the other keyup events while Command is held.
 if(e.code==='MetaLeft'||e.code==='MetaRight'){motion.releaseSource('hardware',performance.now());diagnostics();render();}
});
window.addEventListener('blur',release);
document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
document.querySelector('form').addEventListener('submit',e=>e.preventDefault());
for(const field of document.querySelectorAll('input,textarea'))field.addEventListener('blur',release);
// Text/IME commits are not physical key events: never infer a second key from them.
const ray=new T.Raycaster(),pt=new T.Vector2(),pointerKeys=new Map();
view.addEventListener('pointerdown',e=>{
 // The CSS3D monitor is inside view too. Clicking its editor must not raycast through it.
 if(e.target!==renderer.domElement||e.button!==0)return;
 editor.focus({preventScroll:true});
 const r=renderer.domElement.getBoundingClientRect();pt.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);
 ray.setFromCamera(pt,camera);const hit=ray.intersectObjects(meshes)[0];
 if(hit){const code=hit.object.userData.code;pointerKeys.set(e.pointerId,code);renderer.domElement.setPointerCapture(e.pointerId);press(code,true,'pointer:'+e.pointerId);}
});
function endPointer(e){const code=pointerKeys.get(e.pointerId);if(code){pointerKeys.delete(e.pointerId);press(code,false,'pointer:'+e.pointerId);}}
window.addEventListener('pointerup',endPointer);
window.addEventListener('pointercancel',endPointer);
renderer.domElement.addEventListener('lostpointercapture',endPointer);
window.addEventListener('blur',()=>pointerKeys.clear());

}catch(err){loading.classList.remove('done');loading.textContent='3Dキーボードを読み込めませんでした。ページを再読み込みしてください。';console.error(err);}
