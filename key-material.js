import * as T from 'three';
function noise(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;}
function value(x,y,period=128){const X=Math.floor(x),Y=Math.floor(y),u=x-X,v=y-Y,a=u*u*(3-2*u),b=v*v*(3-2*v);return T.MathUtils.lerp(T.MathUtils.lerp(noise(X%period,Y%period),noise((X+1)%period,Y%period),a),T.MathUtils.lerp(noise(X%period,(Y+1)%period),noise((X+1)%period,(Y+1)%period),a),b);}
function maps(){const n=1024,h=new Float32Array(n*n),normal=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++)h[y*n+x]=.75*value(x/16,y/16,64)+.25*value(x/8,y/8,128);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,dx=(h[y*n+(x+1)%n]-h[y*n+(x+n-1)%n])*6,dy=(h[((y+1)%n)*n+x]-h[((y+n-1)%n)*n+x])*6,v=new T.Vector3(-dx,-dy,1).normalize();normal[i]=Math.round((v.x*.5+.5)*255);normal[i+1]=Math.round((v.y*.5+.5)*255);normal[i+2]=Math.round((v.z*.5+.5)*255);normal[i+3]=255;}const tex=new T.DataTexture(normal,n,n);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;return{h,normal:tex};}
function roughMap(h,variation){const a=new Uint8Array(h.length*4);for(let i=0;i<h.length;i++){const q=Math.round(T.MathUtils.clamp(.96+(h[i]-.5)*variation,0,1)*255);a[i*4]=a[i*4+1]=a[i*4+2]=q;a[i*4+3]=255;}const t=new T.DataTexture(a,1024,1024);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;}
function uv(input){const g=input.index?input.toNonIndexed():input.clone(),p=g.getAttribute('position'),n=g.getAttribute('normal'),a=new Float32Array(p.count*2);for(let i=0;i<p.count;i+=3){const normal=new T.Vector3();for(let j=0;j<3;j++)normal.add(new T.Vector3(n.getX(i+j),n.getY(i+j),n.getZ(i+j)));const x=Math.abs(normal.x),y=Math.abs(normal.y),z=Math.abs(normal.z);for(let j=0;j<3;j++){const q=i+j;if(y>=x&&y>=z){a[q*2]=p.getX(q)/18;a[q*2+1]=p.getZ(q)/18;}else if(x>=z){a[q*2]=p.getZ(q)/18;a[q*2+1]=p.getY(q)/18;}else{a[q*2]=p.getX(q)/18;a[q*2+1]=p.getY(q)/18;}}}g.setAttribute('uv',new T.BufferAttribute(a,2));return g;}

export const smoothMatteSpec=Object.freeze({id:'smooth',color:'#cecac1',roughness:.78,normal:.055,variation:.012});
export function createSmoothMatte(renderer){
 const textures=maps(),m=new T.MeshPhysicalMaterial({color:smoothMatteSpec.color,roughness:.78,metalness:0,ior:1.46,specularIntensity:.45,clearcoat:0,normalMap:textures.normal,normalScale:new T.Vector2(.055,.055),roughnessMap:roughMap(textures.h,.012),envMapIntensity:.7});
 m.name='Node75 · smooth matte';
 for(const t of [m.normalMap,m.roughnessMap])t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 return m;
}
export const prepareCapGeometry=uv;
