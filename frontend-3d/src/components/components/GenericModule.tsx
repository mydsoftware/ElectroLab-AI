interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  label?: string
  accent?: string
}
export function GenericModule({ position, rotation = [0, 0, 0], selected = false, accent = '#dc2626' }: Props) {
  const body = selected ? '#f1c40f' : accent
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.9, 0.12, 0.6]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
    </group>
  )
}
