import { taya } from '@/helpers/videos'
import { useAspect } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { Suspense, useContext, useEffect, useState } from 'react'
import { DoubleSide, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three'

// import { useScene } from '../context/SceneContext'

/**
 *
 * Maybe split up Video into VideoController and VideoPlayer
 * VideoPlayer would be an object in game
 * VideoController would keep track of each players status and currentTime and coordinate with other players
 *
 * AnimationPlayer
 * - accepts objects and scripts to program movement of those objects
 *
 * EventPlayer
 * coordinates with all controllers and players
 *
 * useEvent hook for managing all state?
 * similar to useXR
 *
 *
 */
export const VideoPlayer = () => {
  const size = useAspect(128, 72)

  // const { setIsPlaying } = useScene()
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  // const { channel, updateMedia } = useContext(NetworkContext)

  // const { pod } = useContext(AppContext)
  const [src, setSrc] = useState(taya.videoUrl)
  const onLoadedData = () => {
    setIsVideoLoaded(true)
  }
  const { isPlaying } = useControls({
    isPlaying: false,
  })
  const [video] = useState(() => {
    const vid = document.createElement('video')

    vid.crossOrigin = 'Anonymous'
    vid.loop = true
    vid.volume = 0.2
    vid.height = 1280
    vid.width = 720
    vid.preload = 'metadata'
    vid.onloadeddata = onLoadedData
    vid.setAttribute('style', `opacity: ${isVideoLoaded ? 1 : 0} `)

    vid.currentTime = 0

    return vid
  })

  // useEffect(() => {
  //   if (pod.id === '') return
  //   // setSrc(pod.videoUrl)
  video.pause()
  //   // video.currentTime = payload.currentTime
  //   video.src = pod.videoUrl
  // video.play()
  // }, [pod.id])

  useEffect(() => {
    if (isPlaying) {
      video.play()
    } else {
      video.pause()
    }
  }, [isPlaying, video])
  const setVideoPlayback = (status) => {
    if (status.detail === 'playing') {
      video.play()
    }
    if (status.detail === 'paused') {
      video.pause()
    }
    // console.log(`updating ${pod.id} to ${video.currentTime}`)

    // updateMedia({ podId: pod.id, media: { status: status.detail, currentTime: video.currentTime } })

    // setIsPlaying(status.detail)
    return
  }

  useEffect(() => {
    video.src = src

    // channel.on('syncMedia', (payload: { status: string; currentTime: number; lastUpdated: string }) => {
    //   video.currentTime = payload.currentTime
    //   if (payload.status === 'playing') {
    //     video.play()
    //   }
    //   if (payload.status === 'paused') {
    //     video.pause()
    //   }
    // })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // useEffect(() => {
  //   on('setVideoPlayback', setVideoPlayback)
  //   return () => off('setVideoPlayback', setVideoPlayback)
  // }, [pod.id])

  const videoImage = document.createElement('canvas')
  // videoImage.width = 960
  // videoImage.height = 540
  videoImage.width = 1280
  videoImage.height = 720

  const videoImageContext = videoImage.getContext('2d')
  videoImageContext.fillStyle = '#000000'
  videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height)

  const videoTexture = new Texture(videoImage)
  videoTexture.minFilter = LinearFilter
  videoTexture.magFilter = LinearFilter

  const videoMaterial = new MeshBasicMaterial({ map: videoTexture, side: DoubleSide })
  const movieGeometry = new PlaneGeometry(10, 10)
  const movieScreen = new Mesh(movieGeometry, videoMaterial)

  // movieScreen.rotation.set(0, 0, 90)
  movieScreen.position.set(0, 0, 0)
  movieScreen.rotateY(-Math.PI / 2)

  const { camera } = useThree()

  useFrame(({ gl, scene }) => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      videoImageContext.drawImage(video, 0, 0)
      if (videoTexture) videoTexture.needsUpdate = true
    }

    gl.render(scene, camera)
  }, 1)

  return (
    <>
      <Suspense fallback={<></>}>
        <primitive object={movieScreen} scale={size}></primitive>
      </Suspense>
    </>
  )
}
