import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from '@/components/ui/button'
import { Spacer } from '@/components/ui/spacer'
import { cn } from '@/core/utils'
import { GinggaCTA } from './estimate-section'
import { Cover } from '@/components/ui/cover'
import { H1, P } from '@/components/ui/typography'

function StylizedGlobe() {
  const globeRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = clock.getElapsedTime() * 0.1
    }
  })

  return (
    <Sphere ref={globeRef} args={[1, 64, 32]} scale={2.5}>
      <meshBasicMaterial color="#2a2a2a" wireframe />
      <mesh>
        <sphereGeometry args={[1.001, 64, 32]} />
        <meshBasicMaterial color="#3a3a3a" transparent opacity={0.3} />
      </mesh>
      {/* Simplified continents */}
      <mesh>
        <sphereGeometry args={[1.002, 64, 32]} />
        <meshBasicMaterial color="#4a4a4a" transparent opacity={0.8} />
        <Continents />
      </mesh>
    </Sphere>
  )
}

function Continents() {
  const continentPaths = [
    'M-0.45 0.3 Q-0.2 0.5 0.1 0.4 T0.5 0.2 T0.7 -0.2 T0.4 -0.4 T0 -0.3 T-0.4 -0.1 Z', // North America
    'M-0.1 -0.1 Q0.1 0.1 0.3 0 T0.5 -0.3 T0.3 -0.5 T0 -0.4 Z', // South America
    'M0 0.5 Q0.2 0.4 0.1 0.2 T-0.1 0 T-0.3 0.2 T-0.2 0.4 Z', // Africa
    'M0.3 0.5 Q0.5 0.4 0.7 0.2 T0.6 -0.1 T0.4 0.1 T0.2 0.3 Z', // Europe and Asia
    'M0.7 -0.1 Q0.8 -0.3 0.7 -0.5 T0.5 -0.4 T0.6 -0.2 Z', // Australia
  ]

  return (
    <>
      {continentPaths.map((path, index) => {
        const shape = new THREE.Shape()
        const points = path.split(/(?=[MQ])/).flatMap((cmd) => {
          const [type, ...coords] = cmd.split(/[\s,]/).filter(Boolean)
          if (type === 'M') {
            shape.moveTo(parseFloat(coords[0]), parseFloat(coords[1]))
          } else if (type === 'Q') {
            shape.quadraticCurveTo(
              parseFloat(coords[0]),
              parseFloat(coords[1]),
              parseFloat(coords[2]),
              parseFloat(coords[3]),
            )
          } else if (type === 'T') {
            shape.quadraticCurveTo(
              parseFloat(coords[0]),
              parseFloat(coords[1]),
              parseFloat(coords[0]),
              parseFloat(coords[1]),
            )
          }
          return [parseFloat(coords[0]), parseFloat(coords[1])]
        })
        shape.closePath()

        return (
          <mesh key={index}>
            <shapeGeometry args={[shape]} />
            <meshBasicMaterial color="#5a5a5a" side={THREE.DoubleSide} />
          </mesh>
        )
      })}
    </>
  )
}

export function HighlightedText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-300 to-lime-700 from-40% via-60% to-100%',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function GlobeSection() {
  return (
    <section className="relative text-center mt-24 py-28 px-4 text-gray-200 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <StylizedGlobe />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.5}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
      <div className="relative z-10">
        <div>
          <H1 className="text-4xl md:text-4xl lg:text-5xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-lime-300 to-yellow-500 from-40% via-60% to-100%">
            <Cover className="text-6xl">Accelerating</Cover> <br />
            <span className="pt-4 block">
              globally distributed applications
            </span>
          </H1>
        </div>

        <Spacer size="4xs" />

        <P className="text-xl text-gray-200 mb-8">
          We are an{' '}
          <span className="text-gray-100 font-medium">experienced team</span> of
          developers, and we are founders too.
          <br />
          We build with purpose, validate with data, and adapt with market
          feedback.
        </P>

        <Spacer size="4xs" />

        <div className="flex justify-center space-x-4 mb-16">
          <GinggaCTA />

          <Button
            size="2xl"
            variant="ghost"
            className="from-white to-slate-400 hover:text-white hover:border-gray-800 text-transparent bg-clip-text bg-gradient-to-b animate-gradient"
          >
            Get in touch
          </Button>
        </div>
      </div>
    </section>
  )
}
