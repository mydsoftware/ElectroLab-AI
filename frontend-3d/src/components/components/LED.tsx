interface LEDProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  color?: string
  lit?: boolean
  selected?: boolean
}

export function LED({
  position,
  rotation = [0, 0, 0],
  color = '#e74c3c',
  lit = false,
  selected = false,
}: LEDProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.12, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.85}
          emissive={lit ? color : '#000000'}
          emissiveIntensity={lit ? 1.5 : 0}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.13, 0.12, 24]} />
        <meshStandardMaterial
          color={selected ? '#f1c40f' : color}
          transparent
          opacity={0.9}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 24]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      <mesh position={[0.05, -0.05, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.35, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-0.05, 0.0, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.25, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
