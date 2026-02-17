'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  z: number
  size: number
  opacity: number
  isPixelBlock: boolean
  blockW: number
  blockH: number
}

export default function ParticleNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    const PARTICLE_COUNT = 45
    const CONNECTION_DISTANCE = 120
    const MOUSE = { x: -1000, y: -1000 }
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const isPixelBlock = Math.random() > 0.6
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          z: Math.random() * 100 - 50,
          size: isPixelBlock ? 0 : Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          isPixelBlock,
          blockW: Math.random() * 30 + 6,
          blockH: Math.random() * 12 + 3,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.005

      // Draw connections — thin white lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < CONNECTION_DISTANCE) {
            const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.06
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Mouse connections
        const mdx = particles[i].x - MOUSE.x
        const mdy = particles[i].y - MOUSE.y
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mDist < 180) {
          const alpha = (1 - mDist / 180) * 0.15
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(MOUSE.x, MOUSE.y)
          ctx.stroke()
        }
      }

      // Draw particles — either dots or pixelated blocks
      for (const p of particles) {
        // Parallax z-depth offset
        const parallaxX = Math.sin(time + p.z * 0.02) * (p.z * 0.15)
        const parallaxY = Math.cos(time * 0.7 + p.z * 0.03) * (p.z * 0.1)
        const drawX = p.x + parallaxX
        const drawY = p.y + parallaxY

        if (p.isPixelBlock) {
          // Pixelated rectangle blocks — drifting corrupted data
          const flicker = Math.sin(time * 3 + p.z) > 0.7 ? 0.15 : p.opacity * 0.6
          ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`
          ctx.fillRect(
            Math.round(drawX / 4) * 4,
            Math.round(drawY / 4) * 4,
            p.blockW,
            p.blockH
          )
        } else {
          // Small dots
          ctx.beginPath()
          ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
          ctx.fill()
        }
      }

      // Occasional horizontal glitch bar
      if (Math.random() > 0.985) {
        const barY = Math.random() * canvas.height
        const barH = Math.random() * 3 + 1
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.04 + 0.01})`
        ctx.fillRect(0, barY, canvas.width, barH)
      }
    }

    const update = () => {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < -20 || p.x > canvas.width + 20) p.vx *= -1
        if (p.y < -20 || p.y > canvas.height + 20) p.vy *= -1
      }
    }

    const loop = () => {
      update()
      draw()
      animationId = requestAnimationFrame(loop)
    }

    const handleMouse = (e: MouseEvent) => {
      MOUSE.x = e.clientX
      MOUSE.y = e.clientY
    }

    resize()
    createParticles()
    loop()

    window.addEventListener('resize', () => {
      resize()
      createParticles()
    })
    window.addEventListener('mousemove', handleMouse)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.7, filter: 'contrast(1.3) brightness(0.9)' }}
    />
  )
}
