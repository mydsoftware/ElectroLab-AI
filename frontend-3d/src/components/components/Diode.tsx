interface Props {
  position: [number, number, number]
  rotation?: [number, number, number]
  selected?: boolean
}

export function Diode3D({ position, rotation = [0, 0, 0], selected = false }: Props) {
  const body = selected ? '#f1c40f' : '#111827'
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.28, 12]} />
        <meshStandardMaterial color={body} roughness={0.35} />
      </mesh>
      <mesh position={[0.1, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.072, 0.072, 0.04, 12]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.28, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </mesh>
      <mesh position={[0.28, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.8} />
      </mesh>
    </group>
  )
}
