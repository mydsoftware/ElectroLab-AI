interface PowerProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  voltage?: number
  selected?: boolean
}

export function Power({
  position,
  rotation = [0, 0, 0],
  voltage = 5,
  selected = false,
}: PowerProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.55, 0.28, 0.35]} />
        <meshStandardMaterial color={selected ? '#f1c40f' : '#2c3e50'} roughness={0.4} />
      </mesh>
      <mesh position={[-0.15, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
        <meshStandardMaterial color="#c0392b" metalness={0.5} />
      </mesh>
      <mesh position={[0.15, 0.36, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.18, 0.18]}>
        <boxGeometry args={[0.4, 0.15, 0.02]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      <mesh position={[-0.15, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#c0392b" metalness={0.7} />
      </mesh>
      <mesh position={[0.15, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#555" metalness={0.7} />
      </mesh>
    </group>
  )
}
