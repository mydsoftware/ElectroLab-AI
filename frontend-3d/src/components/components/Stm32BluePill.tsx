interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}
export function Stm32BluePill({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const pcb = selected ? '#38bdf8' : '#0ea5e9'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.15, 0.06, 2.3]} />
        <meshStandardMaterial color={pcb} />
      </mesh>
      <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.4, 0.06, 0.55]} /><meshStandardMaterial color="#0f172a" /></mesh>
      <mesh position={[0, 0.1, -1.05]}><boxGeometry args={[0.3, 0.08, 0.2]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
    </group>
  )
}
