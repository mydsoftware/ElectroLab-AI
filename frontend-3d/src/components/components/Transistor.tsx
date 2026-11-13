interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  label?: string
}

export function Transistor({
  position,
  rotation = [0, 0, 0],
  selected = false,
}: Props) {
  const body = selected ? '#f1c40f' : '#1a1a1a'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.28, 16, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color={body} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[0.02, 0.28, 0.24]} />
        <meshStandardMaterial color={body} roughness={0.45} />
      </mesh>
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}
