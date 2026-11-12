import { useMemo } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { generateHoles, holePosition } from '../lib/breadboard'
import { useCircuitStore } from '../store/circuitStore'

const WIRE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c']

export function HolePickers() {
  const mode = useCircuitStore((s) => s.mode)
  const wireStartHoleId = useCircuitStore((s) => s.wireStartHoleId)
  const setWireStart = useCircuitStore((s) => s.setWireStart)
  const addWire = useCircuitStore((s) => s.addWire)
  const holes = useMemo(() => generateHoles(), [])

  if (mode !== 'wire') return null

  const onHoleClick = (e: ThreeEvent<MouseEvent>, holeId: string, pos: [number, number, number]) => {
    e.stopPropagation()
    if (!wireStartHoleId) {
      setWireStart(holeId)
      return
    }
    if (wireStartHoleId === holeId) {
      setWireStart(null)
      return
    }
    const start = holes.find((h) => h.id === wireStartHoleId)
    if (!start) {
      setWireStart(null)
      return
    }
    const color = WIRE_COLORS[Math.floor(Math.random() * WIRE_COLORS.length)]
    addWire({
      id: `wire-${Date.now()}`,
      fromHoleId: wireStartHoleId,
      toHoleId: holeId,
      fromPos: [start.position[0], start.position[1] + 0.05, start.position[2]],
      toPos: [pos[0], pos[1] + 0.05, pos[2]],
      color,
    })
  }

  return (
    <group>
      {holes.map((h) => {
        const isStart = wireStartHoleId === h.id
        return (
          <mesh
            key={h.id}
            position={h.position}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => onHoleClick(e, h.id, h.position)}
            onPointerOver={(e) => {
              e.stopPropagation()
              document.body.style.cursor = 'crosshair'
            }}
            onPointerOut={() => {
              document.body.style.cursor = 'default'
            }}
          >
            <circleGeometry args={[isStart ? 0.07 : 0.05, 16]} />
            <meshStandardMaterial
              color={isStart ? '#f1c40f' : '#22d3ee'}
              transparent
              opacity={isStart ? 0.95 : 0.35}
              emissive={isStart ? '#f1c40f' : '#0891b2'}
              emissiveIntensity={isStart ? 0.8 : 0.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function previewHole(col: number, row: number) {
  return holePosition(col, row)
}
