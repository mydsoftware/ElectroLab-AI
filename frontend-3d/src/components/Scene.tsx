import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei'
import { Breadboard } from './Breadboard'
import { Resistor } from './components/Resistor'
import { LED } from './components/LED'
import { Power } from './components/Power'
import { Capacitor } from './components/Capacitor'
import { Draggable } from './Draggable'
import { Wires } from './Wires'
import { HolePickers } from './HolePickers'
import { useCircuitStore } from '../store/circuitStore'
import { Suspense } from 'react'

function CircuitComponents() {
  const { components, selectedId, mode } = useCircuitStore()

  return (
    <>
      {components.map((comp) => {
        const isSelected = selectedId === comp.id
        const content = (() => {
          if (comp.type === 'resistor') {
            return (
              <Resistor position={[0, 0, 0]} rotation={comp.rotation} value={String(comp.props.value || '1k')} selected={isSelected} />
            )
          }
          if (comp.type === 'led') {
            return (
              <LED position={[0, 0, 0]} rotation={comp.rotation} color={String(comp.props.color || '#e74c3c')} lit={Boolean(comp.props.lit)} selected={isSelected} />
            )
          }
          if (comp.type === 'power') {
            return (
              <Power position={[0, 0, 0]} rotation={comp.rotation} voltage={Number(comp.props.voltage || 5)} selected={isSelected} />
            )
          }
          if (comp.type === 'capacitor') {
            return (
              <Capacitor position={[0, 0, 0]} rotation={comp.rotation} value={String(comp.props.value || '100n')} selected={isSelected} />
            )
          }
          return null
        })()

        if (mode === 'wire') {
          return (
            <group key={comp.id} position={comp.position}>
              {content}
            </group>
          )
        }

        return (
          <Draggable key={comp.id} id={comp.id} position={comp.position}>
            {content}
          </Draggable>
        )
      })}
    </>
  )
}

export function Scene() {
  const select = useCircuitStore((s) => s.select)
  const mode = useCircuitStore((s) => s.mode)

  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [4, 5, 6], fov: 45 }} onPointerMissed={() => { if (mode === 'select') select(null) }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.45} />
        <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={20} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />
        <Suspense fallback={null}>
          <Breadboard />
          <CircuitComponents />
          <Wires />
          <HolePickers />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.4} scale={12} blur={2.5} far={4} />
          <Grid position={[0, -0.03, 0]} args={[12, 12]} cellSize={0.5} cellThickness={0.4} cellColor="#1e293b" sectionSize={2} sectionThickness={0.8} sectionColor="#334155" fadeDistance={18} infiniteGrid />
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.1} minDistance={3} maxDistance={15} target={[0, 0, 0]} enablePan={true} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
