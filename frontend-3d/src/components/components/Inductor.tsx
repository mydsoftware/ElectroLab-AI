interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  value?: string
}
export function Inductor({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#64748b'
  return (
    <group position={position} rotation={rotation}>
      {[-0.18, -0.06, 0.06, 0.18].map((x, i) => (
        <mesh key={i} position={[x, 0.18, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <torusGeometry args={[0.08, 0.025, 8, 16]} />
          <meshStandardMaterial color={body} metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[-0.35, 0.05, 0]}><cylinderGeometry args={[0.015, 0.015, 0.2, 8]} /><meshStandardMaterial color="#c0c0c0" metalness={0.8} /></mesh>
      <mesh position={[0.35, 0.05, 0]}><cylinderGeometry args={[0.015, 0.015, 0.2, 8]} /><meshStandardMaterial color="#c0c0c0" metalness={0.8} /></mesh>
    </group>
  )
}
