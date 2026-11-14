interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}
export function Transistor({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#1e293b'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.14, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.22, 16]} />
        <meshStandardMaterial color={body} />
      </mesh>
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0.08]}>
          <cylinderGeometry args={[0.012, 0.012, 0.14, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
