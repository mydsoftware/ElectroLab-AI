interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  activePins?: Record<number, boolean>
  onPinClick?: (pin: number) => void
  onPinHover?: (pin: number | null, label?: string) => void
}

export function RaspberryPico({
  position,
  rotation = [0, 0, 0],
  selected = false,
  activePins = {},
  onPinClick,
  onPinHover,
}: Props) {
  const pcb = selected ? '#22c55e' : '#16a34a'
  const left = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  const right = [15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 28]

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.05, 0.06, 2.1]} />
        <meshStandardMaterial color={pcb} roughness={0.5} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.09, -0.95]} castShadow>
        <boxGeometry args={[0.28, 0.08, 0.18]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.11, -0.15]} castShadow>
        <boxGeometry args={[0.28, 0.05, 0.28]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      {left.map((pin, i) => {
        const z = -0.85 + i * 0.12
        const on = Boolean(activePins[pin])
        return (
          <mesh
            key={`L${pin}`}
            position={[-0.45, 0.1, z]}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick?.(pin)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              onPinHover?.(pin, `GP${pin}`)
            }}
            onPointerOut={() => onPinHover?.(null)}
          >
            <boxGeometry args={[0.055, 0.085, 0.045]} />
            <meshStandardMaterial
              color={on ? '#fbbf24' : '#e2e8f0'}
              emissive={on ? '#f59e0b' : '#000'}
              emissiveIntensity={on ? 0.5 : 0}
            />
          </mesh>
        )
      })}
      {right.map((pin, i) => {
        const z = -0.85 + i * 0.13
        const on = Boolean(activePins[pin])
        return (
          <mesh
            key={`R${pin}`}
            position={[0.45, 0.1, z]}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick?.(pin)
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              onPinHover?.(pin, `GP${pin}`)
            }}
            onPointerOut={() => onPinHover?.(null)}
          >
            <boxGeometry args={[0.055, 0.085, 0.045]} />
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
