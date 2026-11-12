interface ResistorProps {
  position: [number, number, number]
  rotation?: [number, number, number]
  value?: string
  selected?: boolean
}

export function Resistor({
  position,
  rotation = [0, 0, 0],
  value = '1k',
  selected = false,
}: ResistorProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.45, 16]} />
        <meshStandardMaterial color={selected ? '#f1c40f' : '#d4a574'} roughness={0.4} />
      </mesh>

      <mesh position={[-0.12, 0.12, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.04, 0.12, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.04, 0.12, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 16]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      <mesh position={[0.12, 0.12, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.03, 16]} />
        <meshStandardMaterial color="#f1c40f" metalness={0.6} />
      </mesh>

      <mesh position={[-0.35, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.35, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}
