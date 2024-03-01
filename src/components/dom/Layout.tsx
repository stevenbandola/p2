'use client'

import { useRef } from 'react'
import dynamic from 'next/dynamic'
import { ModalsProvider } from '@mantine/modals'
import { MantineProvider } from '@mantine/core'
import { Leva } from 'leva'
const Scene = dynamic(() => import('@/components/canvas/Scene'), { ssr: false })

const Layout = ({ children }) => {
  const ref = useRef()

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: ' 100%',
        height: '100%',
        overflow: 'auto',
        touchAction: 'auto',
      }}
    >
      <MantineProvider>
        <ModalsProvider>
          {children}

          <Scene
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              pointerEvents: 'none',
            }}
            eventSource={ref}
            eventPrefix='client'
          />
        </ModalsProvider>
      </MantineProvider>
    </div>
  )
}

export { Layout }
