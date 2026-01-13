import { useMemo } from 'react'
import * as THREE from 'three'

export function Sky() {
  // Generate clouds once and memoize
  const clouds = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      position: [
        Math.random() * 300 - 150,
        60 + Math.random() * 40,
        Math.random() * 300 - 150,
      ] as [number, number, number],
      scale: Math.random() * 15 + 8,
    }))
  }, [])

  return (
    <>
      {/* Sky gradient sphere */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[400, 32, 32]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={{
            topColor: { value: new THREE.Color('#1e5799') },
            bottomColor: { value: new THREE.Color('#87ceeb') },
            offset: { value: 20 },
            exponent: { value: 0.5 },
          }}
          vertexShader={`
            varying vec3 vWorldPosition;
            void main() {
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
              float h = normalize(vWorldPosition + offset).y;
              gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
          `}
        />
      </mesh>

      {/* Static clouds using memoized positions */}
      {clouds.map((cloud) => (
        <mesh key={cloud.id} position={cloud.position}>
          <sphereGeometry args={[cloud.scale, 8, 6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      ))}
    </>
  )
}
