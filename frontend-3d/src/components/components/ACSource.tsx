interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  frequency?: number
  amplitude?: number
}

export function ACSource({
  position,
  rotation = [0, 0, 0],
  selected = false,
}: Props) {
  const body = selected ? '#f1c40f' : '#7c3aed'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.2, 0]} castShadow>
        <boxGeometry args={[0.55, 0.32, 0.4]} />
        <meshStandardMaterial color={body} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2, 0.21]}>
        <boxGeometry args={[0.35, 0.18, 0.02]} />
        <meshStandardMaterial color="#ede9fe" />
      </mesh>
      <mesh position={[-0.15, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#eab308" metalness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#0f172a" metalness={0.6} />
      </mesh>
    </group>
  )
}
