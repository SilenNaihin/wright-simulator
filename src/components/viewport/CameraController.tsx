import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/store/simulationStore'
import { useUIStore } from '@/store/uiStore'

export function CameraController() {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const aircraft = useSimulationStore((s) => s.aircraft)
  const cameraMode = useUIStore((s) => s.cameraMode)
  const offsetRef = useRef(new THREE.Vector3(10, 5, 10))

  // Set initial camera position
  useEffect(() => {
    camera.position.set(10, 5, 10)
    camera.lookAt(0, 1, 0)
  }, [camera])

  // Update camera based on mode
  useFrame(() => {
    if (cameraMode === 'first-person') {
      // First-person cockpit view
      // Position camera at pilot's head position (slightly behind and above center)
      const aircraftQuat = new THREE.Quaternion(
        aircraft.orientation.x,
        aircraft.orientation.y,
        aircraft.orientation.z,
        aircraft.orientation.w
      )

      // Cockpit position offset (pilot sits slightly right and behind center)
      const cockpitOffset = new THREE.Vector3(0.3, 0.8, 0)
      cockpitOffset.applyQuaternion(aircraftQuat)

      const cameraPos = new THREE.Vector3(
        aircraft.position.x + cockpitOffset.x,
        aircraft.position.y + cockpitOffset.y,
        aircraft.position.z + cockpitOffset.z
      )

      // Look forward along aircraft's forward direction
      const forwardDir = new THREE.Vector3(0, 0, 1) // Aircraft faces +Z
      forwardDir.applyQuaternion(aircraftQuat)

      const lookAtPos = new THREE.Vector3(
        cameraPos.x + forwardDir.x * 10,
        cameraPos.y + forwardDir.y * 10,
        cameraPos.z + forwardDir.z * 10
      )

      // Smoothly move camera to cockpit position
      camera.position.lerp(cameraPos, 0.15)

      // Create a smooth look-at by updating camera quaternion
      const targetQuat = new THREE.Quaternion()
      const lookMatrix = new THREE.Matrix4()
      lookMatrix.lookAt(camera.position, lookAtPos, new THREE.Vector3(0, 1, 0))
      targetQuat.setFromRotationMatrix(lookMatrix)
      camera.quaternion.slerp(targetQuat, 0.1)

      // Disable orbit controls in first-person
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }
    } else {
      // Third-person follow mode
      if (controlsRef.current) {
        controlsRef.current.enabled = true

        const targetPos = new THREE.Vector3(
          aircraft.position.x,
          aircraft.position.y + 2,
          aircraft.position.z
        )

        // Smoothly follow the aircraft
        controlsRef.current.target.lerp(targetPos, 0.1)

        // Move camera to maintain relative position behind aircraft
        const desiredCameraPos = new THREE.Vector3(
          aircraft.position.x + offsetRef.current.x,
          Math.max(3, aircraft.position.y + offsetRef.current.y),
          aircraft.position.z + offsetRef.current.z
        )
        camera.position.lerp(desiredCameraPos, 0.05)
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={200}
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[0, 1, 0]}
      onChange={() => {
        // Update offset when user manually moves camera in third-person mode
        if (controlsRef.current && cameraMode === 'third-person') {
          const target = controlsRef.current.target
          offsetRef.current.set(
            camera.position.x - target.x,
            camera.position.y - target.y,
            camera.position.z - target.z
          )
        }
      }}
    />
  )
}
