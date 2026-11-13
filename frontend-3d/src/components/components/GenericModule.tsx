interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  label?: string
  accent?: string
}

export function GenericModule({
  position,
  rotation = [0, 0, 0],
  selected = false,
  accent = '#dc2626',
}: Props) {
  const board = selected ? '#f1c40f' : '#14532d'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.5]} />
        <meshStandardMaterial color={board} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.28, 0.08, 0.22]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>
      <mesh position={[-0.22, 0.16, 0.12]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
        <meshStandardMaterial color={accent} />
      </mesh>
      <mesh position={[0.22, 0.16, 0.12]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {[-0.25, -0.15, -0.05, 0.05, 0.15, 0.25].map((x, i) => (
        <mesh key={i} position={[x, 0.0, -0.22]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
