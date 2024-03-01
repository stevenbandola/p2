import { create } from 'zustand'
import { useEffect, useState } from 'react'
import { on } from '../../../helpers/events'
import {
  ArrowHelper,
  BackSide,
  CircleGeometry,
  Color,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector3,
} from 'three'
import { useXR } from '@react-three/xr'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'

export type OptionType = {
  icon: string
  onClick: () => void
  label: string
  color: string
  active: boolean
}
export const RadialMenu = () => {
  // use styles
  const options: OptionType[] = [
    { icon: 'icon', onClick: () => console.log('clicked'), label: 'label', color: 'color', active: true },
  ]
  // const { isDrawn } = useControls({ isDrawn: false })
  const menuMeshGroup = new Object3D()
  const menuMaterial = new MeshBasicMaterial({ color: new Color('black'), transparent: true, opacity: 0.3 })
  const menuGeometry = new CircleGeometry(6, 40)
  const menuMesh = new Mesh(menuGeometry, menuMaterial)
  menuMesh.name = 'menuMesh'
  // menuMeshGroup.add(menuMesh)

  const menuRadius = 0.75 // Radius of your radial menu
  const numSlices = 8
  const sliceAngle = (2 * Math.PI) / numSlices

  const sliceGeometry = new CircleGeometry(menuRadius, 32, 0, sliceAngle)
  // const material = new MeshBasicMaterial({ color: new Color('red'), transparent: true, opacity: 0.3 })
  // let allObjects = new InstancedMesh(sliceGeometry, material, numSlices)

  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffffff, 0x808080] // Array of sample colors
  for (let i = 0; i < numSlices; i++) {
    const material = new MeshBasicMaterial({ color: colors[i] })
    // allObjects.setColorAt(i, new Color(colors[i]))
    const slice = new Mesh(sliceGeometry, material)
    // allObjects.setMatrixAt(
    //   i,
    //   new Matrix4()
    //     .makeTranslation(menuRadius * Math.cos(i * -sliceAngle), menuRadius * Math.sin(i * -sliceAngle), 0)
    //     .makeRotationZ(-i * sliceAngle - sliceAngle / 2)
    //     .scale(new Vector3(5, 5, 1)),
    // )

    // allObjects.setMatrixAt(i, new Matrix4()
    slice.position.x = menuRadius * Math.cos(i * -sliceAngle)
    slice.position.y = menuRadius * Math.sin(i * -sliceAngle)
    slice.rotation.z = -i * sliceAngle - sliceAngle / 2 // Rotate slices to be oriented correctly
    slice.scale.set(5, 5, 1)
    slice.name = `slice${i}`

    menuMeshGroup.add(slice)
    // menuMeshGroup.attach(slice)
  }
  // menuMeshGroup.add(allObjects)

  const menuSphereGeometry = new SphereGeometry(20, 30, 30)
  const menuSphereMaterial = new MeshBasicMaterial({
    color: new Color('black'),
    transparent: true,
    opacity: 0.2,
    side: BackSide,
  })
  const menuSphereMesh = new Mesh(menuSphereGeometry, menuSphereMaterial)

  menuSphereMesh.name = 'menuSphereMesh'

  const menuGroup = new Object3D()
  menuGroup.name = 'menuGroup'
  menuGroup.add(menuSphereMesh)
  menuGroup.add(menuMeshGroup)

  menuGroup.visible = true

  const useRadialMenuState = create((set) => {
    return {
      countOptions: 4,
      isOpen: false,
      // increment: () => set((state) => ({ count: state.count + 1 })),
    }
  })
  const { player } = useXR()
  const { camera, scene } = useThree()

  const handleMouseDown = (event) => {
    // console.log(player)
    showMenu()
  }

  const handleMouseUp = (event) => {
    useRadialMenuState.setState({ isOpen: false })
    menuGroup.visible = false
  }

  const [origin] = useState(() => new Vector3())
  const sphereRaycaster = new Raycaster()
  const menuRaycaster = new Raycaster()

  // const isDrawn = useRadialMenuState((s: { isDrawn: boolean }) => s.isDrawn)
  const showMenu = () => {
    menuGroup.visible = true
    useRadialMenuState.setState({ isOpen: true })
    menuSphereMesh.geometry.scale(0.5, 0.5, 0.5)

    const updatedQuaternion = menuSphereMesh.quaternion.setFromEuler(camera.rotation)
    menuSphereMesh.quaternion.set(updatedQuaternion.x, updatedQuaternion.y, updatedQuaternion.z, updatedQuaternion.w)

    sphereRaycaster.set(player.position, new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize())
    const intersections = sphereRaycaster.intersectObject(menuSphereMesh)
    if (intersections.length === 0) return

    const point = new Vector3().subVectors(intersections[0].point, player.position)
    // point.copy(menuMeshGroup.position)
    menuMeshGroup.position.copy(point) // Set the position of the menu to the point where the ray intersects the sphere
    menuMeshGroup.lookAt(player.position) // Make the menu look at the player
    // allObjects.updateMatrix()
    // allObjects.matrixAutoUpdate = true
    // menuMeshGroup.quaternion.setFromUnitVectors(new Vector3(0, 0, 0), point.clone().normalize()) // Rotate the menu to be perpendicular to the point
    // menuMeshGroup.matrixAutoUpdate = true
    origin.set(point.x, point.y, point.z)
    // allObjects.instanceMatrix.needsUpdate = true

    menuSphereMesh.geometry.scale(2, 2, 2)
  }
  // const matrix = new Matrix4()
  // useFrame((state) => {
  //   // Act only when the camera has moved
  //   if (!matrix.equals(state.camera.matrixWorld)) {
  //     state.events.update()
  //     matrix.copy(state.camera.matrixWorld)
  //   }
  // })
  const isOpen = useRadialMenuState((s: { isOpen: boolean }) => s.isOpen)
  useFrame(({ gl, scene, camera }) => {
    // if (!isOpen) return
    scene.matrixWorldNeedsUpdate = true
    gl.render(scene, camera)
    // menuRaycaster.set(player.position, new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize())

    // const menuIntersections = menuRaycaster.intersectObjects(slices)
    // console.log(menuIntersections.length)
  }, 1)

  let arrow: ArrowHelper
  useFrame((state) => {
    menuMeshGroup.children.forEach((child) => {
      // console.log(child)
      // child.matrixWorldNeedsUpdate = true
      // child.updateMatrix()
      // child.matrixAutoUpdate = true
      // child.updateMatrixWorld()
      // child.updateMatrix()
      // child.matrixAutoUpdate = true
    })
    // state.scene.matrixWorldNeedsUpdate = true
    // if (menuState.radial === 'open' && controllers) {
    // if (controllers.length === 0) return
    // const controller = controllers[1].controller
    // state.scene.matrixWorldNeedsUpdate = true
    const pointerWorldDirection = new Vector3(0, 0, -1).applyQuaternion(camera.quaternion).normalize()
    const raycaster = new Raycaster(camera.position, pointerWorldDirection, 0, 100)
    // menuMeshGroup.children.forEach((child) => {
    //   return child.raycast(raycaster, [])
    //   // if (child instanceof Mesh) {
    //   // console.log(child.worldToLocal(raycaster.ray.origin))
    //   // }
    // })
    // state.scene.getObjectByName('menuMeshGroup').children
    // if (!state.scene.getObjectByName('slice1')) return
    const intersects = raycaster.intersectObject(menuMeshGroup, true)
    // menuMeshGroup.children.forEach((child) => {
    // console.log(child)
    // if (child instanceof Mesh) {
    // console.log(child.worldToLocal(raycaster.ray.origin))
    // }
    // console.log(child.raycast(raycaster, intersects))
    // return child.raycast(raycaster, intersects)
    // })
    intersects.forEach((intersect) => {
      console.log(intersect.object.name)
      // intersect.object.
      // if (intersect.object.name === 'slice1') {
      //   console.log('slice1')
      // }
    })
    if (intersects.length > 0) console.log(scene)
    // console.log(scene)
    if (!arrow) {
      arrow = new ArrowHelper(raycaster.ray.direction, raycaster.ray.origin, 100, Math.random() * 0xffffff)
      player.add(arrow)
      return () => () => {
        player.remove(arrow)
        arrow.clear()
      }
    }

    arrow.setDirection(raycaster.ray.direction)
    arrow.position.set(raycaster.ray.origin.x, raycaster.ray.origin.y, raycaster.ray.origin.z)
    // }
  })

  useEffect(() => {
    on('mousedown', (e) => {
      handleMouseDown(e)
    })
    on('mouseup', (e) => {
      handleMouseUp(e)
    })

    player.add(menuGroup)

    // return () => {
    //   // cleanup
    //   window.removeEventListener('mousedown', handleMouseDown)
    //   window.removeEventListener('mouseup', handleMouseUp)
    // }
  }, [])

  return <></>
}
