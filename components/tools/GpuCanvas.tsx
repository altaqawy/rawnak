'use client';

import { Canvas } from '@react-three/fiber';
import GpuScene, { type GPUControls, type GPUKind } from '@/components/tools/GpuScenes';
import type { MutableRefObject } from 'react';

export default function GpuCanvas({
  kind,pointer,running,quality,strength,dragging,onContextLost
}:{
  kind:GPUKind;
  pointer:MutableRefObject<GPUControls>;
  running:boolean;
  quality:1|2|3;
  strength:number;
  dragging:boolean;
  onContextLost:()=>void;
}) {
  return <Canvas
    key={kind}
    dpr={[1,quality===3?1.9:quality===2?1.45:1.15]}
    camera={{position:kind==='inside-dome'?[0,0,0]:[0,0,6],fov:kind==='inside-dome'?72:51,near:.05,far:30}}
    gl={{antialias:quality!==1,alpha:false,powerPreference:'low-power'}}
    frameloop={running||dragging?'always':'demand'}
    onCreated={({gl})=>{
      const canvas=gl.domElement;
      canvas.addEventListener('webglcontextlost',onContextLost,{once:true});
    }}
    style={{width:'100%',height:'100%',touchAction:'pan-y'}}
  >
    <GpuScene kind={kind} pointer={pointer} running={running} quality={quality} strength={strength}/>
  </Canvas>;
}
