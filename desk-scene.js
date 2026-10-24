import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
function add(g,m,parent,position){const o=new T.Mesh(g,m);o.position.set(...position);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function rod(a,b,r,m,parent){const from=new T.Vector3(...a),to=new T.Vector3(...b),d=to.clone().sub(from);const o=add(new T.CylinderGeometry(r,r,d.length(),16),m,parent,from.clone().add(to).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;}
function woodTexture(){const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d'),image=ctx.createImageData(1024,1024);let seed=78541;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let y=0;y<1024;y++){const band=2.1*Math.sin(y*.046)+1.2*Math.sin(y*.154)+.55*Math.sin(y*1.3);for(let x=0;x<1024;x++){const grain=band+Math.sin(y*.34+2*Math.sin(x*.0031))*.8+(rand()-.5)*1.15,i=(y*1024+x)*4;image.data[i]=132+grain;image.data[i+1]=110+grain;image.data[i+2]=84+grain;image.data[i+3]=255;}}ctx.putImageData(image,0,0);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(5,5);texture.anisotropy=4;return texture;}
export function installDesk(renderer,scene){
const generator=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=generator.fromScene(room,.12).texture;scene.environmentIntensity=.32;room.dispose();generator.dispose();
scene.add(new T.HemisphereLight(0xe5edff,0x89765e,.9));const bounce=new T.DirectionalLight(0xe4edff,.45);bounce.position.set(350,400,400);scene.add(bounce);
const desk=add(new T.PlaneGeometry(5000,2600),new T.MeshStandardMaterial({map:woodTexture(),roughness:.83,metalness:0,envMapIntensity:.18}),scene,[0,0,-250]);desk.rotation.x=-Math.PI/2;desk.castShadow=false;
scene.background=new T.Color(0x919d90);const wall=add(new T.PlaneGeometry(7000,3600),new T.MeshStandardMaterial({color:0xa6b1a4,roughness:1,metalness:0,envMapIntensity:.12}),scene,[0,1450,-1650]);wall.castShadow=false;

const lamp=new T.Group();lamp.position.set(-180,0,-140);lamp.scale.setScalar(1.6);scene.add(lamp);const paint=new T.MeshStandardMaterial({color:0x26352d,roughness:.43,metalness:.45}),metal=new T.MeshStandardMaterial({color:0x647064,roughness:.4,metalness:.65});
add(new T.CylinderGeometry(53,58,9,64),paint,lamp,[-385,5,-255]);add(new T.CylinderGeometry(13,17,8,32),metal,lamp,[-385,13,-255]);rod([-385,15,-255],[-430,250,-255],4.5,paint,lamp);rod([-430,250,-255],[-360,425,-215],4.5,paint,lamp);
for(const p of [[-385,18,-255],[-430,250,-255],[-360,425,-215]])add(new T.SphereGeometry(8,20,12),metal,lamp,p);
lamp.updateMatrixWorld(true);const head=new T.Group(),headPosition=new T.Vector3(-360,400,-215),target=new T.Vector3(-620,0,-400);head.position.copy(headPosition);head.quaternion.setFromUnitVectors(new T.Vector3(0,-1,0),lamp.worldToLocal(target.clone()).sub(headPosition).normalize());lamp.add(head);
add(new T.CylinderGeometry(29,59,47,64,1,true),new T.MeshStandardMaterial({color:0x26352d,roughness:.4,metalness:.45,side:T.DoubleSide}),head,[0,0,0]);add(new T.CylinderGeometry(26.5,56.5,45,64,1,true),new T.MeshStandardMaterial({color:0xece3cc,roughness:.55,metalness:.25,side:T.BackSide}),head,[0,-.7,0]);
const topCover=add(new T.CircleGeometry(29,64),paint,head,[0,23.5,0]);topCover.rotation.x=-Math.PI/2;
const lip=add(new T.TorusGeometry(58.5,1.8,12,64),paint,head,[0,-23.5,0]);lip.rotation.x=Math.PI/2;const diffuser=add(new T.CircleGeometry(54.5,64),new T.MeshBasicMaterial({color:0xffe5b4,toneMapped:false,side:T.DoubleSide}),head,[0,-22.5,0]);diffuser.rotation.x=Math.PI/2;diffuser.castShadow=false;
const light=new T.SpotLight(0xffe6c5,1800000,2200,.85,1,2);lamp.updateMatrixWorld(true);head.getWorldPosition(light.position);light.target.position.copy(target);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.near=15;light.shadow.camera.far=1800;light.shadow.bias=-.00006;light.shadow.normalBias=.5;light.shadow.radius=5;light.shadow.intensity=.65;scene.add(light,light.target);
// Keep the housing from shadowing its own emitter; the keyboard still casts real shadows.
lamp.traverse(o=>{if(o.isMesh)o.castShadow=false;});
}
