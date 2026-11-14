interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  pressed?: boolean
}
export function PushButton({ position, rotation = [0, 0, 0], selected = false, pressed = false }: Props) {
  const base = selected ? '#f1c40f' : '#1e293b'
  const cap = pressed ? '#dc2626' : '#ef4444'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.28, 0.08, 0.28]} /><meshStandardMaterial color={base} /></mesh>
      <mesh position={[0, pressed ? 0.1 : 0.14, 0]}>
        <cylinderGeometry args={[0.08, 0.09, 0.08, 16]} />
        <meshStandardMaterial color={cap} />
      </mesh>
    </group>
  )
}
