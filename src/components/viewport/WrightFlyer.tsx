import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimulationStore } from '@/store/simulationStore'
import { useControlStore } from '@/store/controlStore'

// Simplified Wright Flyer model built from primitives
// In production, this would be replaced with a proper GLB model

export function WrightFlyer() {
  const groupRef = useRef<THREE.Group>(null)
  const propellerLeftRef = useRef<THREE.Mesh>(null)
  const propellerRightRef = useRef<THREE.Mesh>(null)
  const elevatorRef = useRef<THREE.Group>(null)
  const rudderRef = useRef<THREE.Mesh>(null)

  const aircraft = useSimulationStore((s) => s.aircraft)
  const controls = useControlStore()

  // Materials
  const fabricMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e8e0d0',
    roughness: 0.8,
    side: THREE.DoubleSide,
  }), [])

  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8b6914',
    roughness: 0.7,
  }), [])

  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#666666',
    roughness: 0.4,
    metalness: 0.6,
  }), [])

  // Update position and rotation from physics
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.position.set(
        aircraft.position.x,
        aircraft.position.y,
        aircraft.position.z
      )

      // Convert quaternion to euler for display
      const euler = new THREE.Euler().setFromQuaternion(
        new THREE.Quaternion(
          aircraft.orientation.x,
          aircraft.orientation.y,
          aircraft.orientation.z,
          aircraft.orientation.w
        )
      )
      groupRef.current.rotation.set(euler.x, euler.y, euler.z)
    }

    // Animate propellers
    const propSpeed = aircraft.engineRPM * 0.01
    if (propellerLeftRef.current) {
      propellerLeftRef.current.rotation.z += propSpeed * delta
    }
    if (propellerRightRef.current) {
      propellerRightRef.current.rotation.z -= propSpeed * delta
    }

    // Animate control surfaces
    if (elevatorRef.current) {
      elevatorRef.current.rotation.x = controls.elevator * 0.3
    }
    if (rudderRef.current) {
      rudderRef.current.rotation.y = controls.rudder * 0.4
    }
  })

  return (
    <group ref={groupRef} scale={0.5}>
      {/* Wings - Upper */}
      <mesh position={[0, 1.2, 0]} material={fabricMaterial} castShadow>
        <boxGeometry args={[12, 0.05, 2]} />
      </mesh>

      {/* Wings - Lower */}
      <mesh position={[0, 0, 0]} material={fabricMaterial} castShadow>
        <boxGeometry args={[12, 0.05, 2]} />
      </mesh>

      {/* Wing struts - vertical */}
      {[-4, -2, 0, 2, 4].map((x) => (
        <mesh key={`strut-${x}`} position={[x, 0.6, 0]} material={woodMaterial}>
          <cylinderGeometry args={[0.03, 0.03, 1.2, 8]} />
        </mesh>
      ))}

      {/* Cross bracing wires (simplified as thin boxes) */}
      {[-3, -1, 1, 3].map((x) => (
        <group key={`brace-${x}`}>
          <mesh
            position={[x, 0.6, 0]}
            rotation={[0, 0, 0.4]}
            material={metalMaterial}
          >
            <boxGeometry args={[0.02, 1.4, 0.02]} />
          </mesh>
          <mesh
            position={[x, 0.6, 0]}
            rotation={[0, 0, -0.4]}
            material={metalMaterial}
          >
            <boxGeometry args={[0.02, 1.4, 0.02]} />
          </mesh>
        </group>
      ))}

      {/* Fuselage / Engine cradle */}
      <mesh position={[0, 0.3, 0]} material={woodMaterial} castShadow>
        <boxGeometry args={[3, 0.3, 0.8]} />
      </mesh>

      {/* Engine */}
      <mesh position={[0, 0.5, 0]} material={metalMaterial} castShadow>
        <boxGeometry args={[0.8, 0.4, 0.5]} />
      </mesh>

      {/* Propellers */}
      <group position={[-2, 0.6, 0]}>
        <mesh ref={propellerLeftRef} material={woodMaterial}>
          <boxGeometry args={[0.1, 2, 0.08]} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        </mesh>
      </group>

      <group position={[2, 0.6, 0]}>
        <mesh ref={propellerRightRef} material={woodMaterial}>
          <boxGeometry args={[0.1, 2, 0.08]} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} material={metalMaterial}>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 16]} />
        </mesh>
      </group>

      {/* Front elevator (canard) */}
      <group ref={elevatorRef} position={[0, 0.3, 3]}>
        {/* Elevator surface */}
        <mesh material={fabricMaterial} castShadow>
          <boxGeometry args={[4, 0.03, 0.8]} />
        </mesh>
        {/* Elevator support struts */}
        <mesh position={[-1.5, 0, -1.5]} rotation={[0.3, 0, 0]} material={woodMaterial}>
          <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
        </mesh>
        <mesh position={[1.5, 0, -1.5]} rotation={[0.3, 0, 0]} material={woodMaterial}>
          <cylinderGeometry args={[0.03, 0.03, 2, 8]} />
        </mesh>
      </group>

      {/* Rear rudder */}
      <group position={[0, 0.6, -3.5]}>
        {/* Rudder support */}
        <mesh position={[0, 0, 0.5]} rotation={[0.2, 0, 0]} material={woodMaterial}>
          <cylinderGeometry args={[0.03, 0.03, 1.5, 8]} />
        </mesh>
        {/* Rudder surface */}
        <mesh ref={rudderRef} position={[0, 0.3, 0]} material={fabricMaterial} castShadow>
          <boxGeometry args={[0.03, 1, 0.6]} />
        </mesh>
      </group>

      {/* Landing skids */}
      <mesh position={[-1, -0.3, 0]} rotation={[0, 0, 0]} material={woodMaterial}>
        <boxGeometry args={[0.1, 0.1, 4]} />
      </mesh>
      <mesh position={[1, -0.3, 0]} rotation={[0, 0, 0]} material={woodMaterial}>
        <boxGeometry args={[0.1, 0.1, 4]} />
      </mesh>

      {/* Pilot position (just a simple shape) */}
      <mesh position={[0.5, 0.1, 0]} material={woodMaterial}>
        <boxGeometry args={[0.4, 0.15, 1]} />
      </mesh>
    </group>
  )
}
