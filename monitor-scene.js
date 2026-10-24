import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CSS3DObject} from 'three/addons/renderers/CSS3DRenderer.js';
function part(w,h,d,r,material,scene,position){const m=new T.Mesh(new RoundedBoxGeometry(w,h,d,3,r),material);m.position.set(...position);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
export function installMonitor(scene,element){const shell=new T.MeshStandardMaterial({color:0x2d3532,roughness:.47,metalness:.45}),stand=new T.MeshStandardMaterial({color:0x707b75,roughness:.46,metalness:.65});part(1240,720,30,14,shell,scene,[0,460,-680]);part(100,135,28,7,stand,scene,[0,70,-712]);part(380,13,210,9,stand,scene,[0,7,-650]);
const display=new CSS3DObject(element);display.position.set(0,460,-663.5);scene.add(display);element.classList.add('on-screen');
const glow=new T.PointLight(0xe5ecd9,9000,1000,2);glow.position.set(0,260,-600);scene.add(glow);
}
