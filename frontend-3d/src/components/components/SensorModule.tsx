interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  label?: string
  color?: string
}

export function SensorModule({
  position,
  rotation = [0, 0, 0],
  selected = false,
  color = '#1d4ed8',
}: Props) {
  const board = selected ? '#f1c40f' : color
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.55, 0.06, 0.4]} />
        <meshStandardMaterial color={board} roughness={0.55} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.28, 0.16, 0.22]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.3} />
      </mesh>
      {[-0.15, -0.05, 0.05, 0.15].map((x, i) => (
        <mesh key={i} position={[x, 0.0, 0.18]} castShadow>
          <boxGeometry args={[0.04, 0.12, 0.04]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.6} />
        </mesh>
      ))}
    </group>
  )
}
