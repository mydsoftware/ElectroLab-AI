interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  value?: number
}
export function Potentiometer({ position, rotation = [0, 0, 0], selected = false, value = 512 }: Props) {
  const body = selected ? '#f1c40f' : '#334155'
  const angle = ((value || 0) / 1023) * Math.PI * 1.5 - Math.PI * 0.75
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]}><cylinderGeometry args={[0.16, 0.18, 0.12, 20]} /><meshStandardMaterial color={body} /></mesh>
      <mesh position={[0, 0.2, 0]} rotation={[0, angle, 0]}><boxGeometry args={[0.04, 0.06, 0.14]} /><meshStandardMaterial color="#e2e8f0" /></mesh>
    </group>
  )
}
