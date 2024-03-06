import { ClientChannel, geckos } from '@geckos.io/client'
import { useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { createContext, useEffect, useState, useContext, use } from 'react'
import { AppContext } from './AppController'
import process from 'process'
// import { VoiceChat } from '../controllers/VoiceChat'

export const NetworkController = createContext(null)
import { HathoraCloud } from '@hathora/cloud-sdk-typescript'
import { CreateLobbyRequest, CreateLobbySecurity } from '@hathora/cloud-sdk-typescript/dist/sdk/models/operations'
import {
  ConnectionInfoV2Status,
  Lobby,
  LobbyV3,
  LobbyVisibility,
  Region,
} from '@hathora/cloud-sdk-typescript/dist/sdk/models/shared'
import { connect } from 'http2'

// const developerToken = process.env.HATHORA_DEVELOPER_TOKEN

// const roomClient = new RoomV2Api()
// const lobbyClient = new LobbyV3Api()
// const roomClient = new RoomV2Api(config)
const appId = 'app-b8911170-67b3-4cbc-a28b-88ee3dd0ddc4'
const developerToken =
  'hathora_org_st_kVl5QX8pmyuX6M5DgMIxQ7R0sre3lcqMY6CmK4khvTQpn6ofcg_edd599c65d338169513cf93dae1d773b'
const hathordaSdk = new HathoraCloud({ appId })
const authHeaders = {
  headers: { Authorization: `Bearer ${developerToken}`, 'Content-Type': 'application/json' },
}
export const NetworkProvider = ({ children }) => {
  const [channel, setChannel] = useState<ClientChannel>()
  const [lobby, setLobby] = useState<LobbyV3>()

  // geckos({ port: 26671, url: 'https://t3ffjw.edge.hathora.dev' }),
  // geckos({ port: 443, url: 'https://webrtc.podchur.ch' }),

  const joinRoom = async () => {
    // console.log(process.env.NEXT_PUBLIC_HATHORA_PROCESS_ID)
    const lobbies = await hathordaSdk.lobbyV3.listActivePublicLobbies(undefined, undefined, authHeaders)
    console.log(lobbies)
    const anonymousToken = await hathordaSdk.authV1.loginAnonymous(undefined, authHeaders)
    const lobbySecurity: CreateLobbySecurity = {
      playerAuth: anonymousToken.loginResponse.token,
    }
    if (lobbies.classes.length === 0) {
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
      const _lobby = await hathordaSdk.lobbyV3.createLobby(lobbyRequest, lobbySecurity)
      if (!_lobby.lobbyV3) return
      if (_lobby.lobbyV3) {
        setLobby(_lobby.lobbyV3)
      }

      return
    } else {
      const _lobby = lobbies.classes[0]
      setLobby(_lobby)
    }
    // const createdRoom = await roomClient.createRoom(
    //   appId, // your Hathora application id
    //   {
    //     region: 'Seattle',
    //   },
    //   undefined, // (optional) use to set custom roomIds
    //   { headers: { Authorization: `Bearer ${developerToken}`, 'Content-Type': 'application/json' } },
    // )
  }

  const connectToRoom = async (lobby: LobbyV3) => {
    const room = await hathordaSdk.roomV2.getConnectionInfo(lobby.roomId, undefined, authHeaders)
    console.log(room)
    if (room.connectionInfoV2.status === ConnectionInfoV2Status.Starting) {
      // setLobby(lobby)
      setTimeout(() => {
        connectToRoom(lobby)
      }, 3000)
    } else {
      setChannel(
        geckos({
          port: room.connectionInfoV2.exposedPort.port,
          url: `https://${room.connectionInfoV2.exposedPort.host}`,
        }),
      )
    }
  }

  useEffect(() => {
    if (!lobby) return
    connectToRoom(lobby)
  }, [lobby])

  const [channelId, setChannelId] = useState('')
  const { camera } = useThree()
  const { player } = useXR()
  const { pod, podHistory, loadPod, location } = useContext(AppContext)

  // let userRole = 'guest'
  let userRole = 'admin'

  useEffect(() => {
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
      if (channel.id) channel.close()
    })

    return () => {
      if (channel.id) channel.close()
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

  useEffect(() => {
    joinRoom()
  }, [])
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
