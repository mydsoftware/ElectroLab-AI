interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}
export function GroundSymbol({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const c = selected ? '#f1c40f' : '#94a3b8'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.012, 0.012, 0.2, 6]} /><meshStandardMaterial color={c} metalness={0.5} /></mesh>
      {[0.14, 0.08, 0.04].map((w, i) => (
        <mesh key={i} position={[0, 0.02 - i * 0.04, 0]}>
          <boxGeometry args={[w, 0.015, 0.02]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}
