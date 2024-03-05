import { createContext, useEffect, useState } from 'react'
// import { SceneProvider } from './SceneContext'

import { NetworkProvider } from './NetworkController'
export const AppContext = createContext(null)

export const AppProvider = ({ children }) => {
  const initPod = { id: '', videoUrl: '', sphereUrl: '' }
  const [pod, setPod] = useState(initPod)
  const [podHistory, setPodHistory] = useState([])
  const pods = [
    {
      id: 'pod1',
      videoUrl:
        'https://video.fyyc2-1.fna.fbcdn.net/v/t66.35162-29/10000000_1418204352133643_1279092334898636950_n.mp4',
      sphereUrl: 'https://i.postimg.cc/MG3k6HFx/church3.jpg',
      currentTime: null,
    },
    {
      id: 'pod3',
      videoUrl:
        "https://cdn.lbryplayer.xyz/api/v4/streams/free/I'm-Still-Here---Joel-Houston---Hillsong-Worship---Creative-Conference-2019/c2d6d791ed04b744fc6dd63a3ac5d66d8578de16/895744?download=true",
      sphereUrl: 'https://i.postimg.cc/MG3k6HFx/church3.jpg',
      currentTime: null,
    },
    {
      id: 'pod2',
      videoUrl:
        'https://cdn.lbryplayer.xyz/api/v4/streams/free/yt1s.com---WorshipThroughIt-Wednesday-with-Taya-from-Hillsong-United_720p/631efd83313d26a7e23c9e3d6fee582d0878170f/93313a?download=true',
      sphereUrl: 'https://i.postimg.cc/TPtxKChz/back.jpg',
      currentTime: null,
    },
    {
      id: 'pod4',
      videoUrl:
        'https://cdn.lbryplayer.xyz/api/v4/streams/free/1974live/96e242a0c20380ec29d770e55ada86a3293b01da/6bd5a6?download=true',
      sphereUrl: 'https://i.postimg.cc/TPtxKChz/back.jpg',
      currentTime: null,
    },
  ]

  const loadPod = (podId) => {
    console.log('loading', podId)

    // fetch new pod data
    const selectedPod = pods.filter((p) => p.id === podId)[0]

    const newPod = selectedPod ? selectedPod : initPod
    setPod(newPod)

    podHistory.unshift(newPod)
    setPodHistory(podHistory)
    // update scene with new pod data
  }

  return (
    <AppContext.Provider value={{ loadPod, pod, podHistory, location }}>
      <NetworkProvider>
        {/* <SceneProvider> */}
        {children}
        {/* </SceneProvider> */}
      </NetworkProvider>
    </AppContext.Provider>
  )
}
