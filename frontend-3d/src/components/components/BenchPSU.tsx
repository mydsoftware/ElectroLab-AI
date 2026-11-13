interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}

export function BenchPSU({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#1e293b'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.1, 0.7, 0.85]} />
        <meshStandardMaterial color={body} roughness={0.4} />
      </mesh>
      <mesh position={[-0.25, 0.5, 0.43]}>
        <boxGeometry args={[0.35, 0.2, 0.02]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.25, 0.5, 0.43]}>
        <boxGeometry args={[0.35, 0.2, 0.02]} />
        <meshStandardMaterial color="#14532d" emissive="#22c55e" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[-0.2, 0.2, 0.44]}>
        <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
        <meshStandardMaterial color="#dc2626" metalness={0.5} />
      </mesh>
      <mesh position={[0.2, 0.2, 0.44]}>
        <cylinderGeometry args={[0.05, 0.05, 0.06, 12]} />
        <meshStandardMaterial color="#2563eb" metalness={0.5} />
      </mesh>
    </group>
  )
}
