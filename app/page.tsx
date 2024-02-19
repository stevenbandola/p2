'use client'

import { SkySphere } from '@/components/canvas/SkySphere'
import { VideoPlayer } from '@/components/canvas/VideoPlayer'
import { DesktopFlyController } from '@/components/controllers/DesktopFlyController'
import { Hud, PointerLockControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { XR } from '@react-three/xr'
import dynamic from 'next/dynamic'
import { Suspense, useState } from 'react'

const Logo = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Logo), { ssr: false })
const Dog = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Dog), { ssr: false })
const Duck = dynamic(() => import('@/components/canvas/Examples').then((mod) => mod.Duck), { ssr: false })
const View = dynamic(() => import('@/components/canvas/View').then((mod) => mod.View), {
  ssr: false,
  loading: () => (
    <div className='flex h-96 w-full flex-col items-center justify-center'>
      <svg className='-ml-1 mr-3 h-5 w-5 animate-spin text-black' fill='none' viewBox='0 0 24 24'>
        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
        <path
          className='opacity-75'
          fill='currentColor'
          d='M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        />
      </svg>
    </div>
  ),
})
const Common = dynamic(() => import('@/components/canvas/View').then((mod) => mod.Common), { ssr: false })

export default function Page() {
  const [pointerLock, setPointerLock] = useState(false)
  if (!pointerLock) {
    return (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          textAlign: 'center',
          justifySelf: 'center',
          backgroundColor: 'gray',
        }}
        onClick={() => setPointerLock(true)}
      >
        Click Anywhere To Start! / Right click and hold to open menu
      </div>
    )
  } else {
    return (
      <>
        {/* a full width comonent with a view for a new component */}

        <div className='mx-auto flex h-full w-full flex-col flex-wrap items-center   lg:w-4/5'>
          {/* jumbo */}

          <div className='h-full w-full text-center '>
            {/* <View className='flex h-full w-full flex-col items-center justify-center'> */}
            {/* <Suspense fallback={null}> */}
            <Canvas>
              <Hud renderPriority={1}>
                <XR>
                  {/* <Logo route='/blob' scale={0.6} position={[0, 0, 0]} /> */}
                  <DesktopFlyController />
                  <PointerLockControls />
                  <VideoPlayer />
                  <SkySphere />
                  {/* <Common color={'blue'} /> */}
                </XR>
              </Hud>
            </Canvas>
            {/* </Suspense> */}
            {/* </View> */}
          </div>
        </div>
      </>
    )
  }
}
