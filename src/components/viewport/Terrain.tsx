import { useMemo } from 'react'

export function Terrain() {
  // Generate grass patches once and memoize
  const grassPatches = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      position: [
        Math.random() * 200 - 100,
        0.02,
        Math.random() * 200 - 100,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      radius: Math.random() * 3 + 1,
      hue: 80 + Math.random() * 20,
      sat: 40 + Math.random() * 20,
      light: 25 + Math.random() * 15,
    }))
  }, [])

  return (
    <group>
      {/* Main ground plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial
          color="#3d5a1f"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      {/* Runway - dirt/sand strip like Kitty Hawk */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[8, 150]} />
        <meshStandardMaterial
          color="#8b7355"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Runway center line markers */}
      {Array.from({ length: 15 }).map((_, i) => (
        <mesh
          key={`marker-${i}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, -70 + i * 10]}
        >
          <planeGeometry args={[0.3, 3]} />
          <meshStandardMaterial color="#c4b896" roughness={1} />
        </mesh>
      ))}

      {/* Launch rail - the Wright Brothers used a wooden rail */}
      <mesh position={[0, 0.1, -20]} castShadow>
        <boxGeometry args={[0.15, 0.1, 40]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
      <mesh position={[0.5, 0.05, -20]}>
        <boxGeometry args={[0.8, 0.05, 40]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>

      {/* Grid helper for reference */}
      <gridHelper
        args={[200, 40, '#2a3a1a', '#2a3a1a']}
        position={[0, 0.02, 0]}
      />

      {/* Grass patches - using memoized positions */}
      {grassPatches.map((patch) => (
        <mesh
          key={patch.id}
          position={patch.position}
          rotation={[-Math.PI / 2, 0, patch.rotation]}
        >
          <circleGeometry args={[patch.radius, 8]} />
          <meshStandardMaterial
            color={`hsl(${patch.hue}, ${patch.sat}%, ${patch.light}%)`}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  )
}
