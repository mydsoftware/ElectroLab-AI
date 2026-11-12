import { useMemo } from 'react'
import * as THREE from 'three'
import { useCircuitStore } from '../store/circuitStore'

function WireMesh({
  from,
  to,
  color,
}: {
  from: [number, number, number]
  to: [number, number, number]
  color: string
}) {
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().lerp(b, 0.5)
    mid.y += 0.35 + Math.min(a.distanceTo(b) * 0.15, 0.5)
    return new THREE.QuadraticBezierCurve3(a, mid, b)
  }, [from, to])

  const tubular = useMemo(
    () => new THREE.TubeGeometry(curve, 20, 0.018, 8, false),
    [curve]
  )

  return (
    <mesh geometry={tubular}>
      <meshStandardMaterial color={color} metalness={0.4} roughness={0.35} />
    </mesh>
  )
}

export function Wires() {
  const wires = useCircuitStore((s) => s.wires)
  return (
    <group>
      {wires.map((w) => (
        <WireMesh key={w.id} from={w.fromPos} to={w.toPos} color={w.color} />
      ))}
    </group>
  )
}
