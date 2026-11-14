interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}
export function RaspberryPico({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const pcb = selected ? '#22c55e' : '#16a34a'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[1.05, 0.06, 2.1]} />
        <meshStandardMaterial color={pcb} />
      </mesh>
      <mesh position={[0, 0.11, -0.15]}><boxGeometry args={[0.28, 0.05, 0.28]} /><meshStandardMaterial color="#0f172a" /></mesh>
      <mesh position={[0, 0.09, -0.95]}><boxGeometry args={[0.28, 0.08, 0.18]} /><meshStandardMaterial color="#d4d4d8" /></mesh>
    </group>
  )
}
