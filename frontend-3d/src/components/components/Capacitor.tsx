interface CapacitorProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  value?: string
  selected?: boolean
}

export function Capacitor({
  position,
  rotation = [0, 0, 0],
  value = '100n',
  selected = false,
}: CapacitorProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[-0.06, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.28, 0.22]} />
        <meshStandardMaterial color={selected ? '#f1c40f' : '#95a5a6'} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0.06, 0.18, 0]} castShadow>
        <boxGeometry args={[0.04, 0.28, 0.22]} />
        <meshStandardMaterial color={selected ? '#f1c40f' : '#95a5a6'} metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.2, 0.22, 0.18]} />
        <meshStandardMaterial color="#34495e" roughness={0.5} />
      </mesh>
      <mesh position={[-0.2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.25, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.2, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.25, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
