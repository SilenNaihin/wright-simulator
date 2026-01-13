import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSimulationStore } from '@/store/simulationStore'

interface CameraControllerProps {
  followEnabled: boolean
}

export function CameraController({ followEnabled }: CameraControllerProps) {
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const aircraft = useSimulationStore((s) => s.aircraft)
  const offsetRef = useRef(new THREE.Vector3(10, 5, 10))

  // Set initial camera position
  useEffect(() => {
    camera.position.set(10, 5, 10)
    camera.lookAt(0, 1, 0)
  }, [camera])

  // Follow the aircraft
  useFrame(() => {
    if (controlsRef.current && followEnabled) {
      const targetPos = new THREE.Vector3(
        aircraft.position.x,
        aircraft.position.y + 2,
        aircraft.position.z
      )

      // Smoothly follow the aircraft
      controlsRef.current.target.lerp(targetPos, 0.1)

      // Move camera to maintain relative position
      const desiredCameraPos = new THREE.Vector3(
        aircraft.position.x + offsetRef.current.x,
        Math.max(3, aircraft.position.y + offsetRef.current.y),
        aircraft.position.z + offsetRef.current.z
      )
      camera.position.lerp(desiredCameraPos, 0.05)
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={3}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2 - 0.05}
      target={[0, 1, 0]}
      onChange={() => {
        // Update offset when user manually moves camera
        if (controlsRef.current && !followEnabled) {
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
