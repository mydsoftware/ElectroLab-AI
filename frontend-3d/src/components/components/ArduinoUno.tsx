interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}
export function ArduinoUno({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const pcb = selected ? '#0d9488' : '#00979d'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <boxGeometry args={[1.7, 0.08, 1.15]} />
        <meshStandardMaterial color={pcb} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[-0.75, 0.12, -0.15]}><boxGeometry args={[0.28, 0.12, 0.22]} /><meshStandardMaterial color="#d4d4d8" metalness={0.6} /></mesh>
      <mesh position={[0.05, 0.14, 0.05]}><boxGeometry args={[0.35, 0.06, 0.35]} /><meshStandardMaterial color="#0f172a" /></mesh>
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[0.78, 0.12, -0.5 + i * 0.075]}>
          <boxGeometry args={[0.06, 0.1, 0.05]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.5} />
        </mesh>
      ))}
    </group>
  )
}
