import { ClientChannel, geckos } from '@geckos.io/client'
import { useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { createContext, useEffect, useState, useContext } from 'react'
import { AppContext } from './AppController'

// import { VoiceChat } from '../controllers/VoiceChat'

export const NetworkController = createContext(null)
import { HathoraCloud } from '@hathora/cloud-sdk-typescript'
import { CreateLobbyRequest } from '@hathora/cloud-sdk-typescript/dist/sdk/models/operations'
import { LobbyVisibility, Region } from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared'

// const developerToken = process.env.HATHORA_DEVELOPER_TOKEN

// const roomClient = new RoomV2Api()
// const lobbyClient = new LobbyV3Api()
// const roomClient = new RoomV2Api(config)
const appId = 'app-b8911170-67b3-4cbc-a28b-88ee3dd0ddc4'
const developerToken =
  'hathora_org_st_kVl5QX8pmyuX6M5DgMIxQ7R0sre3lcqMY6CmK4khvTQpn6ofcg_edd599c65d338169513cf93dae1d773b'
const hathordaSdk = new HathoraCloud({ appId })
export const NetworkProvider = ({ children }) => {
  const [channel, setChannel] = useState<ClientChannel>(geckos({ port: 39229, url: 'https://xz6tks.edge.hathora.dev' }))

  // geckos({ port: 26671, url: 'https://t3ffjw.edge.hathora.dev' }),
  // geckos({ port: 443, url: 'https://webrtc.podchur.ch' }),

  const joinRoom = async () => {
    const lobbies = await hathordaSdk.lobbyV3.listActivePublicLobbies(appId, undefined, {
      headers: { Authorization: `Bearer ${developerToken}`, 'Content-Type': 'application/json' },
    })
    console.log(lobbies)
    if (lobbies.rawResponse.data.length === 0) {
      // console.log('no lobbies')
      const lobbyRequest: CreateLobbyRequest = {
        createLobbyV3Params: {
          region: Region.Seattle,
          // appId: appId,
          roomConfig: '',
          // region: 'Seattle',
          visibility: LobbyVisibility.Public,
          // roomConfig: undefined,
        },
      }
      const lobby = hathordaSdk.lobbyV3
        .createLobby(lobbyRequest, { playerAuth: '' })
        // .createLobby(appId, { region: 'Seattle', visibility: 'local', roomConfig: undefined }, '1212')
        .then((res) => console.log(res))
      console.log(lobby)
      return
    }
    // const createdRoom = await roomClient.createRoom(
    //   appId, // your Hathora application id
    //   {
    //     region: 'Seattle',
    //   },
    //   undefined, // (optional) use to set custom roomIds
    //   { headers: { Authorization: `Bearer ${developerToken}`, 'Content-Type': 'application/json' } },
    // )

    // console.log(createdRoom)
    // setup polling on the room

    const { connectionInfoV2 } = await hathordaSdk.roomV2.getConnectionInfo(appId, '2zkkhqs770zyp', {
      headers: { Authorization: `Bearer ${developerToken}`, 'Content-Type': 'application/json' },
    })
    // if (connectionInfoV2.status === 'active') {
    //   setChannel(() => geckos({ port: connectionInfoV2.exposedPort.port, url: connectionInfoV2.exposedPort.host }))
    // }
    // const app = await new AppV1Api().getAppInfo(appId)
    const rooms = console.log(connectionInfoV2)
  }

  const [channelId, setChannelId] = useState('')
  const { camera } = useThree()
  const { player } = useXR()
  const { pod, podHistory, loadPod, location } = useContext(AppContext)

  // let userRole = 'guest'
  let userRole = 'admin'

  useEffect(() => {
    joinRoom()
    console.log(channel)
    if (!channel) return
    channel.onConnect((error) => {
      if (error) {
        console.log(error)

        return
      }
      setChannelId(channel.id)
      console.log('connected to server')
      const podId = location.pathname.replace('/', '')

      loadPod(podId)
      movePlayer()
    })

    channel.onDisconnect(() => {
      if (channel) channel.close()
    })

    joinRoom()
    return () => {
      if (channel) channel.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channel])

  useEffect(() => {
    // unload the old pod
    // load the new pod

    if (!pod.id || !channel) return
    const podId = location.pathname.replace('/', '')
    loadPod(podId)

    // console.log('location changed', podId)
  }, [location])

  useEffect(() => {
    if (!pod.id || !channel) return

    if (podHistory.length > 1) {
      // console.log('pod switched from ' + podHistory[1].id + ' to ' + pod.id)
      // console.log('leaving', podHistory[1])

      channel.emit('leavePod', { podId: podHistory[1].id })
    }

    // console.log('network content pod id changed', pod)
    channel.emit('joinPod', { podId: pod.id })

    // console.log(podHistory)
  }, [pod.id])

  /**
   *
   * Move Player
   * move the player in their pod
   *
   */

  const updateMedia = (payload) => {
    // TODO: typify and simplify sync code

    if (userRole === 'admin') {
      // console.log('updating media', payload)

      channel.emit('updateMedia', payload)
    }
  }

  const movePlayer = () => {
    const payload = {
      podId: pod.id,
      client: {
        id: channel.id,
        position: player.position,
        quaternion: camera.quaternion,
      },
    }
    // console.log(payload)

    channel.emit('movePlayer', payload)
  }

  return (
    <NetworkController.Provider value={{ channel, movePlayer, updateMedia, channelId }}>
      {/* <VoiceChat /> */}
      {children}
    </NetworkController.Provider>
  )
}

export const useNetwork = () => useContext(NetworkController)
