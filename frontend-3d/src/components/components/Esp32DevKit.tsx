interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  activePins?: Record<number, boolean>
  onPinClick?: (pin: number) => void
}

export function Esp32DevKit({
  position,
  rotation = [0, 0, 0],
  selected = false,
  activePins = {},
  onPinClick,
}: Props) {
  const pcb = selected ? '#1e3a8a' : '#1e40af'
  const leftGpios = [0, 2, 4, 5, 12, 13, 14, 15]
  const rightGpios = [16, 17, 18, 19, 21, 22, 23, 25, 26, 27]

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.07, 1.3]} />
        <meshStandardMaterial color={pcb} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.1, -0.62]} castShadow>
        <boxGeometry args={[0.22, 0.08, 0.12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.14, 0.15]} castShadow>
        <boxGeometry args={[0.55, 0.08, 0.7]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} />
      </mesh>
      {leftGpios.map((pin, i) => {
        const z = -0.45 + i * 0.12
        const on = Boolean(activePins[pin])
        return (
          <mesh
            key={`L${pin}`}
            position={[-0.62, 0.11, z]}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick?.(pin)
            }}
          >
            <boxGeometry args={[0.06, 0.09, 0.05]} />
            <meshStandardMaterial
              color={on ? '#fbbf24' : '#e2e8f0'}
              emissive={on ? '#f59e0b' : '#000'}
              emissiveIntensity={on ? 0.5 : 0}
            />
          </mesh>
        )
      })}
      {rightGpios.map((pin, i) => {
        const z = -0.5 + i * 0.1
        const on = Boolean(activePins[pin])
        return (
          <mesh
            key={`R${pin}`}
            position={[0.62, 0.11, z]}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick?.(pin)
            }}
          >
            <boxGeometry args={[0.06, 0.09, 0.05]} />
            <meshStandardMaterial
              color={on ? '#fbbf24' : '#e2e8f0'}
              emissive={on ? '#f59e0b' : '#000'}
              emissiveIntensity={on ? 0.5 : 0}
            />
          </mesh>
        )
      })}
    </group>
  )
}
