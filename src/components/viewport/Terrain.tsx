import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function Terrain() {
  const oceanRef = useRef<THREE.Mesh>(null)

  // Animate ocean waves
  useFrame((state) => {
    if (oceanRef.current) {
      // Subtle wave motion
      oceanRef.current.position.y = -0.5 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  // Generate grass patches once and memoize
  const grassPatches = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      position: [
        Math.random() * 180 + 15, // Keep to the right side (positive X, away from ocean)
        0.02,
        Math.random() * 350 - 175,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      radius: Math.random() * 4 + 1.5,
      hue: 75 + Math.random() * 30,
      sat: 35 + Math.random() * 25,
      light: 22 + Math.random() * 18,
    }))
  }, [])

  // Generate sand dunes (Kitty Hawk style) - keep away from runway
  const sandDunes = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      position: [
        -45 + Math.random() * 15, // Further left, away from runway
        0,
        Math.random() * 300 - 150,
      ] as [number, number, number],
      scale: [
        6 + Math.random() * 10,
        0.8 + Math.random() * 1.5,
        5 + Math.random() * 7,
      ] as [number, number, number],
      rotation: Math.random() * 0.3 - 0.15,
    }))
  }, [])

  // Generate small shrubs/bushes - more dense
  const shrubs = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      position: [
        15 + Math.random() * 150,
        0,
        Math.random() * 300 - 150,
      ] as [number, number, number],
      scale: 0.3 + Math.random() * 0.7,
      color: `hsl(${90 + Math.random() * 40}, ${30 + Math.random() * 25}%, ${18 + Math.random() * 18}%)`,
    }))
  }, [])

  // Generate sea grass tufts along the beach
  const seaGrass = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      position: [
        -20 + Math.random() * 30,
        0.1,
        Math.random() * 250 - 125,
      ] as [number, number, number],
      height: 0.3 + Math.random() * 0.4,
      rotation: Math.random() * Math.PI,
    }))
  }, [])

  // Generate rocks - scattered across landscape
  const rocks = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      position: [
        20 + Math.random() * 160,
        0,
        Math.random() * 300 - 150,
      ] as [number, number, number],
      scale: [
        0.2 + Math.random() * 1.0,
        0.15 + Math.random() * 0.5,
        0.2 + Math.random() * 0.8,
      ] as [number, number, number],
      rotation: Math.random() * Math.PI,
      color: `hsl(0, 0%, ${35 + Math.random() * 25}%)`,
    }))
  }, [])

  // Generate trees - mixed near and far
  const trees = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      position: [
        25 + Math.random() * 160,
        0,
        Math.random() * 350 - 175,
      ] as [number, number, number],
      trunkHeight: 1.2 + Math.random() * 1.5,
      canopySize: 1.2 + Math.random() * 2,
      treeType: Math.random() > 0.5 ? 'conifer' : 'deciduous',
    }))
  }, [])

  // Generate small hills/mounds
  const hills = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      position: [
        40 + Math.random() * 140,
        0,
        Math.random() * 300 - 150,
      ] as [number, number, number],
      scale: [
        15 + Math.random() * 25,
        2 + Math.random() * 4,
        12 + Math.random() * 20,
      ] as [number, number, number],
    }))
  }, [])

  // Generate tall grass clumps
  const tallGrass = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      position: [
        12 + Math.random() * 170,
        0,
        Math.random() * 320 - 160,
      ] as [number, number, number],
      height: 0.4 + Math.random() * 0.6,
      rotation: Math.random() * Math.PI,
      blades: 3 + Math.floor(Math.random() * 4),
    }))
  }, [])

  return (
    <group>
      {/* Ocean - on the left side (negative X) */}
      <mesh
        ref={oceanRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-200, -0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[300, 500]} />
        <meshStandardMaterial
          color="#1a5276"
          roughness={0.3}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Beach/shoreline gradient */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-35, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 500]} />
        <meshStandardMaterial
          color="#d4b896"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Main ground plane - grass */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[100, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[400, 500]} />
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

      {/* Sand dunes */}
      {sandDunes.map((dune) => (
        <mesh
          key={`dune-${dune.id}`}
          position={dune.position}
          rotation={[0, dune.rotation, 0]}
          scale={dune.scale}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#c4a35a" roughness={1} />
        </mesh>
      ))}

      {/* Sea grass tufts */}
      {seaGrass.map((grass) => (
        <group key={`seagrass-${grass.id}`} position={grass.position} rotation={[0, grass.rotation, 0]}>
          {/* Multiple blades per tuft */}
          {[0, 0.3, -0.3, 0.15, -0.15].map((offset, idx) => (
            <mesh
              key={idx}
              position={[offset * 0.3, grass.height / 2, offset * 0.2]}
              rotation={[0.1 + Math.random() * 0.2, 0, offset * 0.3]}
            >
              <boxGeometry args={[0.02, grass.height, 0.01]} />
              <meshStandardMaterial color="#6b7c3f" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Shrubs/bushes */}
      {shrubs.map((shrub) => (
        <mesh
          key={`shrub-${shrub.id}`}
          position={shrub.position}
          scale={shrub.scale}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={shrub.color} roughness={0.9} />
        </mesh>
      ))}

      {/* Rocks */}
      {rocks.map((rock) => (
        <mesh
          key={`rock-${rock.id}`}
          position={rock.position}
          scale={rock.scale}
          rotation={[0, rock.rotation, 0]}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={rock.color} roughness={0.95} />
        </mesh>
      ))}

      {/* Hills/mounds */}
      {hills.map((hill) => (
        <mesh
          key={`hill-${hill.id}`}
          position={hill.position}
          scale={hill.scale}
          receiveShadow
        >
          <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#3a5020" roughness={1} />
        </mesh>
      ))}

      {/* Tall grass clumps */}
      {tallGrass.map((grass) => (
        <group key={`tallgrass-${grass.id}`} position={grass.position} rotation={[0, grass.rotation, 0]}>
          {Array.from({ length: grass.blades }).map((_, idx) => (
            <mesh
              key={idx}
              position={[(idx - grass.blades / 2) * 0.08, grass.height / 2, (idx % 2) * 0.05]}
              rotation={[0.05 + Math.random() * 0.1, 0, (idx - grass.blades / 2) * 0.15]}
            >
              <boxGeometry args={[0.03, grass.height, 0.01]} />
              <meshStandardMaterial color="#4a6b2a" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Trees */}
      {trees.map((tree) => (
        <group key={`tree-${tree.id}`} position={tree.position}>
          {/* Trunk */}
          <mesh position={[0, tree.trunkHeight / 2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, tree.trunkHeight, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.9} />
          </mesh>
          {/* Canopy - different shapes for variety */}
          {tree.treeType === 'conifer' ? (
            <mesh position={[0, tree.trunkHeight + tree.canopySize * 0.5, 0]} castShadow>
              <coneGeometry args={[tree.canopySize * 0.7, tree.canopySize * 2, 8]} />
              <meshStandardMaterial color="#1a3d0c" roughness={0.9} />
            </mesh>
          ) : (
            <mesh position={[0, tree.trunkHeight + tree.canopySize * 0.5, 0]} castShadow>
              <sphereGeometry args={[tree.canopySize * 0.8, 8, 6]} />
              <meshStandardMaterial color="#2d5016" roughness={0.9} />
            </mesh>
          )}
        </group>
      ))}

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

      {/* Ocean foam/wave line */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-50, 0.03, 0]}
      >
        <planeGeometry args={[2, 400]} />
        <meshStandardMaterial
          color="#a8c8d8"
          roughness={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  )
}
