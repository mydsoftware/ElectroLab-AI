interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}
export function Esp32DevKit({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const pcb = selected ? '#1e3a8a' : '#1e40af'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[1.4, 0.07, 1.3]} />
        <meshStandardMaterial color={pcb} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.14, 0.15]}><boxGeometry args={[0.55, 0.08, 0.7]} /><meshStandardMaterial color="#94a3b8" metalness={0.7} /></mesh>
      <mesh position={[0, 0.1, -0.62]}><boxGeometry args={[0.22, 0.08, 0.12]} /><meshStandardMaterial color="#cbd5e1" /></mesh>
    </group>
  )
}
