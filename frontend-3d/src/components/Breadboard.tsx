import { useMemo } from 'react'
import { BOARD_COLS, BOARD_ROWS, HOLE_SPACING, generateHoles } from '../lib/breadboard'

const BOARD_WIDTH = BOARD_COLS * HOLE_SPACING + 0.4
const BOARD_DEPTH = BOARD_ROWS * HOLE_SPACING + 1.2
const BOARD_HEIGHT = 0.18

function Hole({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.04, 16]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
    </mesh>
  )
}

export function Breadboard() {
  const holes = useMemo(() => generateHoles(), [])
  const railOffsetZ = (BOARD_ROWS * HOLE_SPACING) / 2 + 0.35

  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH, BOARD_HEIGHT, BOARD_DEPTH]} />
        <meshStandardMaterial color="#e8e0d5" roughness={0.7} metalness={0.05} />
      </mesh>

      <mesh position={[0, BOARD_HEIGHT / 2 + 0.005, 0]} receiveShadow>
        <boxGeometry args={[BOARD_WIDTH - 0.05, 0.01, BOARD_DEPTH - 0.05]} />
        <meshStandardMaterial color="#f0e9de" roughness={0.65} />
      </mesh>

      <mesh position={[0, BOARD_HEIGHT / 2 + 0.01, 0]}>
        <boxGeometry args={[BOARD_WIDTH - 0.1, 0.03, 0.15]} />
        <meshStandardMaterial color="#d4cbb8" />
      </mesh>

      {holes.map((h) => (
        <Hole key={h.id} position={h.position} />
      ))}

      <mesh position={[-BOARD_WIDTH / 2 + 0.12, BOARD_HEIGHT / 2 + 0.01, railOffsetZ]}>
        <boxGeometry args={[0.08, 0.02, BOARD_COLS * HOLE_SPACING * 0.9]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[-BOARD_WIDTH / 2 + 0.12, BOARD_HEIGHT / 2 + 0.01, -railOffsetZ]}>
        <boxGeometry args={[0.08, 0.02, BOARD_COLS * HOLE_SPACING * 0.9]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>
      <mesh position={[BOARD_WIDTH / 2 - 0.12, BOARD_HEIGHT / 2 + 0.01, railOffsetZ]}>
        <boxGeometry args={[0.08, 0.02, BOARD_COLS * HOLE_SPACING * 0.9]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[BOARD_WIDTH / 2 - 0.12, BOARD_HEIGHT / 2 + 0.01, -railOffsetZ]}>
        <boxGeometry args={[0.08, 0.02, BOARD_COLS * HOLE_SPACING * 0.9]} />
        <meshStandardMaterial color="#2980b9" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[BOARD_WIDTH + 1, BOARD_DEPTH + 1]} />
        <shadowMaterial opacity={0.25} />
      </mesh>
    </group>
  )
}
