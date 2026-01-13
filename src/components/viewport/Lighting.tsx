export function Lighting() {
  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight intensity={0.4} />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />

      {/* Fill light from opposite side */}
      <directionalLight
        position={[-30, 50, -30]}
        intensity={0.3}
      />

      {/* Hemisphere light for sky/ground color variation */}
      <hemisphereLight
        args={['#87ceeb', '#8b7355', 0.3]}
      />
    </>
  )
}
