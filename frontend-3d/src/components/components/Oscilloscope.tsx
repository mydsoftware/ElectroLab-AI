interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}

export function Oscilloscope({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#1e293b'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.6, 1.0, 1.1]} />
        <meshStandardMaterial color={body} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.65, 0.56]}>
        <boxGeometry args={[1.1, 0.65, 0.04]} />
        <meshStandardMaterial color="#0ea5e9" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>
      {[-0.55, -0.35, -0.15, 0.15, 0.35, 0.55].map((x, i) => (
        <mesh key={i} position={[x, 0.25, 0.56]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 0.08, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
