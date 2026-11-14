interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  amplitude?: number
  frequency?: number
}
export function ACSource({ position, rotation = [0, 0, 0], selected = false, amplitude = 5 }: Props) {
  const body = selected ? '#a78bfa' : '#7c3aed'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.5, 0.2, 0.35]} />
        <meshStandardMaterial color={body} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[0.35, 0.02, 0.2]} />
        <meshStandardMaterial color="#ddd6fe" />
      </mesh>
      <mesh position={[-0.15, 0.02, 0]}><cylinderGeometry args={[0.02, 0.02, 0.08, 8]} /><meshStandardMaterial color="#ef4444" /></mesh>
      <mesh position={[0.15, 0.02, 0]}><cylinderGeometry args={[0.02, 0.02, 0.08, 8]} /><meshStandardMaterial color="#0f172a" /></mesh>
    </group>
  )
}
