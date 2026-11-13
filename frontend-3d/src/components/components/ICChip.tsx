interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  pins?: number
  label?: string
}

export function ICChip({
  position,
  rotation = [0, 0, 0],
  selected = false,
  pins = 8,
}: Props) {
  const perSide = Math.max(4, Math.ceil(pins / 2))
  const length = Math.max(0.5, perSide * 0.12)
  const width = 0.38
  const bodyColor = selected ? '#f1c40f' : '#111827'

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[length, 0.14, width]} />
        <meshStandardMaterial color={bodyColor} roughness={0.5} />
      </mesh>
      <mesh position={[-length / 2 + 0.06, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[length * 0.6, 0.01, width * 0.5]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      {Array.from({ length: perSide }).map((_, i) => {
        const z = (i - (perSide - 1) / 2) * 0.1
        return (
          <group key={i}>
            <mesh position={[-length / 2 - 0.04, 0.04, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
            </mesh>
            <mesh position={[length / 2 + 0.04, 0.04, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.12, 6]} />
              <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
