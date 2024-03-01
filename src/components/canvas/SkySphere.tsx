import { Html } from '@react-three/drei'
import { useLoader, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'

import { Suspense, useEffect, useRef, useState, useContext } from 'react'
import { BackSide, Mesh, MeshBasicMaterial, TextureLoader } from 'three'

export const SkySphere = () => {
  const [textures, setTextures] = useState([])

  const InvertSphere = (props) => {
    const [image] = useState<string>('/img/backgrounds/ice.jpeg')

    const meshRef = useRef<Mesh>()
    const materialRef = useRef<MeshBasicMaterial>()
    const texture = useLoader(TextureLoader, image)

    const { player, isPresenting } = useXR()
    const { camera } = useThree()

    useEffect(() => {
      player.position.set(-100, 0, 0)
      camera.rotateY(-Math.PI / 2)
      camera.position.set(0, 0, 0)
      camera.far = 100000
      camera.updateProjectionMatrix()
      materialRef.current.map = texture
      materialRef.current.needsUpdate = true
    }, [])

    // console.log('🚀 ~ cleanup ~ texture:', texture)

    // useEffect(() => {
    //   // console.log('🚀 ~ //useEffect ~ texture:', texture)
    // }, [props.pod.id])

    return (
      <mesh ref={meshRef}>
        <sphereGeometry attach='geometry' args={[500, 500, 500]} />
        <meshBasicMaterial ref={materialRef} attach='material' side={BackSide} />
      </mesh>
    )
  }

  const Fallback = () => (
    <Html>
      <p>Loading...</p>
    </Html>
  )

  return (
    <Suspense fallback={<Fallback />}>
      <InvertSphere textures={textures} setTextures={setTextures} />
      {/* <InvertSphere pod={pod} textures={textures} setTextures={setTextures} /> */}
    </Suspense>
  )
}
