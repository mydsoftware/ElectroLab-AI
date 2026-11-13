interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}

export function FunctionGenerator({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#334155'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.2, 0.55, 0.9]} />
        <meshStandardMaterial color={body} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.4, 0.46]}>
        <boxGeometry args={[0.7, 0.28, 0.03]} />
        <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}
