interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  label?: string
  kind?: 'lcd' | 'oled' | 'tft' | 'matrix'
}

export function DisplayModule({
  position,
  rotation = [0, 0, 0],
  selected = false,
  kind = 'lcd',
}: Props) {
  const frame = selected ? '#f1c40f' : '#0f172a'
  const screen =
    kind === 'oled' ? '#0ea5e9' : kind === 'tft' ? '#1e3a8a' : kind === 'matrix' ? '#14532d' : '#1e293b'

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.9, 0.05, 0.45]} />
        <meshStandardMaterial color="#166534" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.85, 0.08, 0.4]} />
        <meshStandardMaterial color={frame} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <boxGeometry args={[0.72, 0.02, 0.28]} />
        <meshStandardMaterial
          color={screen}
          emissive={screen}
          emissiveIntensity={kind === 'oled' ? 0.35 : 0.15}
          roughness={0.2}
        />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.08, 0.0, 0.22]} castShadow>
          <boxGeometry args={[0.035, 0.1, 0.035]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
