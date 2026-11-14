import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei'
import { Breadboard } from './Breadboard'
import { Resistor } from './components/Resistor'
import { LED } from './components/LED'
import { Power } from './components/Power'
import { Capacitor } from './components/Capacitor'
import { ACSource } from './components/ACSource'
import { Inductor } from './components/Inductor'
import { Diode3D } from './components/Diode'
import { GroundSymbol } from './components/Ground'
import { PushButton } from './components/PushButton'
import { Potentiometer } from './components/Potentiometer'
import { Transistor } from './components/Transistor'
import { ArduinoUno } from './components/ArduinoUno'
import { Esp32DevKit } from './components/Esp32DevKit'
import { RaspberryPico } from './components/RaspberryPico'
import { Stm32BluePill } from './components/Stm32BluePill'
import { GenericModule } from './components/GenericModule'
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
        const idLower = String(comp.catalogId || comp.label || '').toLowerCase()
        const content = (() => {
          switch (comp.type) {
            case 'resistor':
              return <Resistor position={[0, 0, 0]} rotation={comp.rotation} value={String(comp.props.value || '1k')} selected={isSelected} />
            case 'led':
              return <LED position={[0, 0, 0]} rotation={comp.rotation} color={String(comp.props.color || '#e74c3c')} lit={Boolean(comp.props.lit)} selected={isSelected} />
            case 'power':
              return <Power position={[0, 0, 0]} rotation={comp.rotation} voltage={Number(comp.props.voltage || 5)} selected={isSelected} />
            case 'capacitor':
              return <Capacitor position={[0, 0, 0]} rotation={comp.rotation} value={String(comp.props.value || '100n')} selected={isSelected} />
            case 'acsource':
              return <ACSource position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
            case 'inductor':
              return <Inductor position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
            case 'diode':
              return <Diode3D position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
            case 'ground':
              return <GroundSymbol position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
            case 'button':
              return <PushButton position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} pressed={Boolean(comp.props.pressed)} />
            case 'potentiometer':
              return <Potentiometer position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} value={Number(comp.props.analogValue ?? 512)} />
            case 'transistor':
              return <Transistor position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
            case 'module':
              if (idLower.includes('arduino') || idLower.includes('uno'))
                return <ArduinoUno position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
              if (idLower.includes('esp'))
                return <Esp32DevKit position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
              if (idLower.includes('pico') || idLower.includes('rp2040'))
                return <RaspberryPico position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
              if (idLower.includes('stm32') || idLower.includes('blue'))
                return <Stm32BluePill position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
              return <GenericModule position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} accent={String(comp.props.accent || '#dc2626')} />
            default:
              return <GenericModule position={[0, 0, 0]} rotation={comp.rotation} selected={isSelected} />
          }
        })()

        if (mode === 'wire') {
          return <group key={comp.id} position={comp.position}>{content}</group>
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
        <directionalLight position={[5, 8, 5]} intensity={1.1} castShadow />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />
        <Suspense fallback={null}>
          <Breadboard />
          <CircuitComponents />
          <Wires />
          <HolePickers />
          <ContactShadows position={[0, -0.02, 0]} opacity={0.4} scale={12} blur={2.5} far={4} />
          <Grid position={[0, -0.03, 0]} args={[12, 12]} cellSize={0.5} cellThickness={0.4} cellColor="#1e293b" sectionSize={2} sectionThickness={0.8} sectionColor="#334155" fadeDistance={18} infiniteGrid />
        </Suspense>
        <OrbitControls makeDefault minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.1} minDistance={3} maxDistance={15} enablePan />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
