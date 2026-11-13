interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}

export function Multimeter({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#f8fafc'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.55, 0.7, 0.25]} />
        <meshStandardMaterial color={body} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.5, 0.13]}>
        <boxGeometry args={[0.42, 0.22, 0.02]} />
        <meshStandardMaterial color="#1e3a8a" emissive="#1e40af" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 0.22, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  )
}
