'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';

export type GPUKind = 'atlas-globe' | 'inside-dome' | 'silk-ribbon';
export type GPUControls = { x:number; y:number; dragX:number; dragY:number; pressed:boolean; active:boolean };
export type GPUSceneProps = {
  kind:GPUKind;
  pointer:MutableRefObject<GPUControls>;
  running:boolean;
  quality:1|2|3;
  strength:number;
};

function GlobeScene({pointer,running,quality,strength}:Omit<GPUSceneProps,'kind'>){
  const globe=useRef<THREE.Group>(null);
  const phase=useRef(0);
  const {dots,grid}=useMemo(()=>{
    const n=quality===3?1800:quality===2?1100:540;
    const positions=new Float32Array(n*3);
    for(let i=0;i<n;i++){
      const y=1-i/(n-1)*2;
      const r=Math.sqrt(Math.max(0,1-y*y));
      const a=i*Math.PI*(3-Math.sqrt(5));
      positions[i*3]=r*Math.cos(a)*1.65;
      positions[i*3+1]=y*1.65;
      positions[i*3+2]=r*Math.sin(a)*1.65;
    }
    const vertices:number[]=[];
    const vertex=(lat:number,lon:number)=>{
      const c=Math.cos(lat);
      return [Math.cos(lon)*c*1.663,Math.sin(lat)*1.663,Math.sin(lon)*c*1.663];
    };
    const segment=(a:number[],b:number[])=>{vertices.push(...a,...b)};
    for(let i=-4;i<=4;i++){const lat=i*Math.PI/12;for(let j=0;j<120;j++)segment(vertex(lat,j*Math.PI/60),vertex(lat,(j+1)*Math.PI/60))}
    for(let i=0;i<18;i++){const lon=i*Math.PI/9;for(let j=0;j<72;j++)segment(vertex(-Math.PI/2+j*Math.PI/72,lon),vertex(-Math.PI/2+(j+1)*Math.PI/72,lon))}
    return {dots:positions,grid:new Float32Array(vertices)};
  },[quality]);
  const markers=useMemo(()=>[
    [30.04,31.24],[40.7,-74],[51.5,-.12],[35.7,139.7],[-33.9,151.2],[25.2,55.27],
  ].map(([latDegrees,lonDegrees])=>{
    const lat=latDegrees*Math.PI/180,lon=lonDegrees*Math.PI/180;
    return [Math.cos(lat)*Math.cos(lon)*1.69,Math.sin(lat)*1.69,Math.cos(lat)*Math.sin(lon)*1.69] as [number,number,number];
  }),[]);
  useFrame((_,delta)=>{
    if(!globe.current)return;
    const dt=Math.min(.05,delta);
    if(running&&!pointer.current.pressed)phase.current+=dt*.17;
    const rotY=phase.current+pointer.current.dragX*.004*strength/16;
    const rotX=THREE.MathUtils.clamp(-.22+pointer.current.dragY*.003*strength/16,-.8,.8);
    globe.current.rotation.y=THREE.MathUtils.damp(globe.current.rotation.y,rotY,4,dt);
    globe.current.rotation.x=THREE.MathUtils.damp(globe.current.rotation.x,rotX,5,dt);
  });
  return <>
    <color attach="background" args={['#050505']}/>
    <group ref={globe} rotation={[-.22,0,0]}>
      <mesh><sphereGeometry args={[1.64,32,24]}/><meshBasicMaterial color="#151515"/></mesh>
      <points>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[dots,3]}/></bufferGeometry>
        <pointsMaterial color="#eeeeee" size={quality===1?.022:.015} sizeAttenuation transparent opacity={.84} depthWrite={false}/>
      </points>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[grid,3]}/></bufferGeometry>
        <lineBasicMaterial color="#aaaaaa" transparent opacity={.22} depthWrite={false}/>
      </lineSegments>
      {markers.map((position,i)=><group position={position} key={i}>
        <mesh><sphereGeometry args={[.032,10,8]}/><meshBasicMaterial color="#ffffff"/></mesh>
        <mesh><sphereGeometry args={[.064,10,8]}/><meshBasicMaterial color="#ffffff" transparent opacity={.14} depthWrite={false}/></mesh>
      </group>)}
    </group>
  </>;
}
const domeVertex=[
  'varying vec2 vUv;',
  'void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
].join('\n');
const domeFragment=[
  'precision mediump float;',
  'varying vec2 vUv;',
  'uniform float uTime;',
  'uniform float uStrength;',
  'uniform vec2 uPointer;',
  'float grid(float n,float w){return 1.0-smoothstep(w,w*2.0,abs(fract(n)-.5));}',
  'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'void main(){',
  'vec2 uv=vUv;',
  'float horizon=1.0-smoothstep(.2,.65,abs(uv.y-.5));',
  'float rings=grid(uv.y*20.0,.035)*.20;',
  'float meridians=grid(uv.x*38.0,.035)*.15;',
  'vec2 q=uv-vec2(.5+uPointer.x*.10,.48+uPointer.y*.10);',
  'float disk=exp(-dot(q,q)*19.0)*.21;',
  'float wave=sin(length(q)*37.0-uTime*.5)*.014*horizon*uStrength;',
  'float star=step(.996,hash(floor(uv*vec2(360.0,180.0))));',
  'vec3 tone=vec3(.017,.020,.025)+vec3(.15)*(rings+meridians)*horizon+vec3(.65)*disk+vec3(.65)*star+vec3(wave);',
  'tone+=vec3(.065)*pow(max(0.0,1.0-abs(uv.y-.48)*2.0),3.0);',
  'gl_FragColor=vec4(clamp(tone,0.0,1.0),1.0);',
  '}',
].join('\n');

function DomeScene({pointer,running,strength,quality}:Omit<GPUSceneProps,'kind'>){
  const {camera}=useThree();
  const time=useRef(0);
  const material=useRef<THREE.ShaderMaterial>(null);
  const uniforms=useMemo(()=>({
    uTime:{value:0},uStrength:{value:strength/20},uPointer:{value:new THREE.Vector2(0,0)}
  }),[]);
  useFrame((_,dt)=>{
    dt=Math.min(.05,dt);
    if(running)time.current+=dt;
    if(material.current){
      material.current.uniforms.uTime.value=time.current;
      material.current.uniforms.uStrength.value=strength/20;
      material.current.uniforms.uPointer.value.set(pointer.current.x,pointer.current.y);
    }
    camera.rotation.order='YXZ';
    camera.rotation.y=THREE.MathUtils.damp(camera.rotation.y,-pointer.current.x*.38,2.5,dt);
    camera.rotation.x=THREE.MathUtils.damp(camera.rotation.x,-pointer.current.y*.22,2.5,dt);
  });
  return <>
    <color attach="background" args={['#050505']}/>
    <mesh>
      <sphereGeometry args={[7,quality===1?32:64,quality===1?24:48]}/>
      <shaderMaterial ref={material} args={[{vertexShader:domeVertex,fragmentShader:domeFragment,uniforms,side:THREE.BackSide,depthWrite:false}]}/>
    </mesh>
    <group position={[0,-2,-3]}>
      <mesh rotation={[-Math.PI/2,0,0]}>
        <circleGeometry args={[4,48]}/>
        <meshBasicMaterial color="#090909" transparent opacity={.7}/>
      </mesh>
      <mesh position={[0,.15,0]}>
        <torusGeometry args={[.7,.009,6,80]}/>
        <meshBasicMaterial color="#bcbcbc" transparent opacity={.7}/>
      </mesh>
    </group>
  </>;
}
function RibbonScene({pointer,running,quality,strength}:Omit<GPUSceneProps,'kind'>){
  const count=quality===1?32:quality===2?56:80;
  const geometry=useMemo(()=>{
    const geo=new THREE.BufferGeometry();
    const positions=new Float32Array((count+1)*6);
    const colors=new Float32Array(positions.length);
    const indices:number[]=[];
    for(let i=0;i<=count;i++){
      const brightness=(1-i/count)*.82+.08;
      for(let s=0;s<2;s++){const k=(i*2+s)*3;colors[k]=brightness;colors[k+1]=brightness;colors[k+2]=brightness}
      if(i<count){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2)}
    }
    geo.setAttribute('position',new THREE.BufferAttribute(positions,3));
    geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
    geo.setIndex(indices);
    return geo;
  },[count]);
  useEffect(()=>()=>geometry.dispose(),[geometry]);
  const material=useMemo(()=>new THREE.MeshBasicMaterial({side:THREE.DoubleSide,vertexColors:true,transparent:true,opacity:.95,depthWrite:false}),[]);
  useEffect(()=>()=>material.dispose(),[material]);
  const path=useRef<THREE.Vector3[]>([]);
  const time=useRef(0);
  const head=useRef(new THREE.Vector3(0,0,.4));
  const target=useRef(new THREE.Vector3(0,0,.4));
  useFrame((_,dt)=>{
    dt=Math.min(dt,.05);
    if(running)time.current+=dt;
    const x=pointer.current.active?pointer.current.x*3.7:Math.sin(time.current*.65)*1.7;
    const y=pointer.current.active?-pointer.current.y*2.3:Math.cos(time.current*.85)*.95;
    target.current.set(x,y,.4);
    head.current.lerp(target.current,1-Math.exp(-dt*(2.7+strength*.22)));
    if(path.current.length!==count+1)path.current=Array.from({length:count+1},()=>head.current.clone());
    const points=path.current;
    points[0].copy(head.current);
    for(let i=1;i<points.length;i++){
      points[i].lerp(points[i-1],1-Math.exp(-dt*(6+strength*.15)));
      points[i].z=Math.sin(i*.19+time.current*1.3)*.24;
    }
    const attr=geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr=attr.array as Float32Array;
    for(let i=0;i<points.length;i++){
      const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)];
      let dx=b.x-a.x,dy=b.y-a.y;
      const length=Math.hypot(dx,dy)||1;dx/=length;dy/=length;
      const width=.24*(1-i/(count+1))+.003;
      const p=points[i];
      for(let side=0;side<2;side++){
        const j=(i*2+side)*3,sign=side===0?1:-1;
        arr[j]=p.x-dy*width*sign;arr[j+1]=p.y+dx*width*sign;arr[j+2]=p.z;
      }
    }
    attr.needsUpdate=true;
  });
  const stars=useMemo(()=>{
    const arr=new Float32Array(200*3);
    for(let i=0;i<200;i++){arr[i*3]=Math.sin(i*17.3)*4.2;arr[i*3+1]=Math.cos(i*11.1)*2.7;arr[i*3+2]=-1.4+(i%6)*.03}
    return arr;
  },[]);
  return <>
    <color attach="background" args={['#050505']}/>
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[stars,3]}/></bufferGeometry>
      <pointsMaterial color="#ffffff" size={.012} sizeAttenuation transparent opacity={.37}/>
    </points>
    <mesh geometry={geometry} material={material}/>
  </>;
}
export default function GpuScene({kind,pointer,running,quality,strength}:GPUSceneProps) {
  if(kind==='atlas-globe')return <GlobeScene pointer={pointer} running={running} quality={quality} strength={strength}/>;
  if(kind==='inside-dome')return <DomeScene pointer={pointer} running={running} quality={quality} strength={strength}/>;
  return <RibbonScene pointer={pointer} running={running} quality={quality} strength={strength}/>;
}
