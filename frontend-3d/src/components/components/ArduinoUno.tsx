interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
  activePins?: Record<number, boolean>
  onPinClick?: (pin: number) => void
}

export function ArduinoUno({
  position,
  rotation = [0, 0, 0],
  selected = false,
  activePins = {},
  onPinClick,
}: Props) {
  const pcb = selected ? '#0d9488' : '#00979d'
  const digitalPins = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
  const analogPins = [14, 15, 16, 17, 18, 19]

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.08, 1.15]} />
        <meshStandardMaterial color={pcb} roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[-0.75, 0.12, -0.15]} castShadow>
        <boxGeometry args={[0.28, 0.12, 0.22]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-0.7, 0.12, 0.35]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.18, 12]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0.05, 0.14, 0.05]} castShadow>
        <boxGeometry args={[0.35, 0.06, 0.35]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>
      <mesh position={[0.65, 0.14, 0.4]}>
        <boxGeometry args={[0.06, 0.03, 0.06]} />
        <meshStandardMaterial
          color={activePins[13] ? '#fbbf24' : '#78350f'}
          emissive={activePins[13] ? '#f59e0b' : '#000'}
          emissiveIntensity={activePins[13] ? 0.8 : 0}
        />
      </mesh>
      {digitalPins.map((pin, i) => {
        const z = -0.5 + i * 0.075
        const on = Boolean(activePins[pin])
        return (
          <mesh
            key={`d${pin}`}
            position={[0.78, 0.12, z]}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick?.(pin)
            }}
          >
            <boxGeometry args={[0.06, 0.1, 0.05]} />
            <meshStandardMaterial
              color={on ? '#fbbf24' : '#e2e8f0'}
              emissive={on ? '#f59e0b' : '#000'}
              emissiveIntensity={on ? 0.5 : 0}
              metalness={0.5}
            />
          </mesh>
        )
      })}
      {analogPins.map((pin, i) => {
        const z = 0.15 + i * 0.08
        const on = Boolean(activePins[pin])
        return (
          <mesh
            key={`a${pin}`}
            position={[-0.78, 0.12, z]}
            onClick={(e) => {
              e.stopPropagation()
              onPinClick?.(pin)
            }}
          >
            <boxGeometry args={[0.06, 0.1, 0.05]} />
            <meshStandardMaterial
              color={on ? '#34d399' : '#e2e8f0'}
              emissive={on ? '#10b981' : '#000'}
              emissiveIntensity={on ? 0.4 : 0}
              metalness={0.5}
            />
          </mesh>
        )
      })}
    </group>
  )
}
