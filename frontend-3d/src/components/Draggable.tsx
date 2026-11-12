import { useRef, useState } from 'react'
import { ThreeEvent, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { snapToNearestHole } from '../lib/breadboard'
import { useCircuitStore } from '../store/circuitStore'

interface DraggableProps {
  id: string
  position: [number, number, number]
  children: React.ReactNode
}

export function Draggable({ id, position, children }: DraggableProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { controls } = useThree()
  const updateComponent = useCircuitStore((s) => s.updateComponent)
  const select = useCircuitStore((s) => s.select)

  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const planeIntersect = useRef(new THREE.Vector3())

  const getBoardPoint = (e: ThreeEvent<PointerEvent>) => {
    e.ray.intersectPlane(plane.current, planeIntersect.current)
    return planeIntersect.current
  }

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    e.target.setPointerCapture(e.pointerId)
    select(id)
    setIsDragging(true)
    if (controls) {
      ;(controls as any).enabled = false
    }
  }

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current) return
    e.stopPropagation()
    const point = getBoardPoint(e)
    groupRef.current.position.set(point.x, position[1], point.z)
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging || !groupRef.current) return
    e.stopPropagation()
    e.target.releasePointerCapture(e.pointerId)
    setIsDragging(false)
    if (controls) {
      ;(controls as any).enabled = true
    }
    const current = groupRef.current.position
    const snapped = snapToNearestHole(current.x, current.z)
    if (snapped) {
      const finalPos: [number, number, number] = [
        snapped.position[0],
        position[1],
        snapped.position[2],
      ]
      groupRef.current.position.set(...finalPos)
      updateComponent(id, { position: finalPos })
    } else {
      groupRef.current.position.set(...position)
    }
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {children}
      <mesh visible={false} position={[0, 0.15, 0]}>
        <boxGeometry args={[0.8, 0.45, 0.4]} />
        <meshBasicMaterial />
      </mesh>
    </group>
  )
}
