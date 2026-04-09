'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
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
    const PARTICLE_COUNT = 25
    const CONNECTION_DISTANCE_SQ = 100 * 100
    const MOUSE_DISTANCE_SQ = 150 * 150
    const MOUSE = { x: -1000, y: -1000 }
    let lastFrameTime = 0
    const FRAME_INTERVAL = 1000 / 15 // 15fps — light background effect
    let isVisible = true

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      particles = []
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          size: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.35 + 0.08,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy

          if (distSq < CONNECTION_DISTANCE_SQ) {
            const alpha = (1 - Math.sqrt(distSq) / 100) * 0.06
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }

        // Mouse connections
        const mdx = particles[i].x - MOUSE.x
        const mdy = particles[i].y - MOUSE.y
        const mDistSq = mdx * mdx + mdy * mdy
        if (mDistSq < MOUSE_DISTANCE_SQ) {
          const alpha = (1 - Math.sqrt(mDistSq) / 150) * 0.12
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(MOUSE.x, MOUSE.y)
          ctx.stroke()
        }
      }

      // Draw particles — simple circles only
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`
        ctx.fill()
      }
    }

    const update = () => {
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < -10 || p.x > canvas.width + 10) p.vx *= -1
        if (p.y < -10 || p.y > canvas.height + 10) p.vy *= -1
      }
    }

    const loop = (timestamp: number) => {
      if (!isVisible) return
      animationId = requestAnimationFrame(loop)

      if (timestamp - lastFrameTime < FRAME_INTERVAL) return
      lastFrameTime = timestamp

      update()
      draw()
    }

    const handleMouse = (e: MouseEvent) => {
      MOUSE.x = e.clientX
      MOUSE.y = e.clientY
    }

    const handleVisibility = () => {
      isVisible = !document.hidden
      if (isVisible) {
        lastFrameTime = 0
        animationId = requestAnimationFrame(loop)
      }
    }

    const handleResize = () => {
      resize()
      createParticles()
    }

    resize()
    createParticles()
    animationId = requestAnimationFrame(loop)

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouse, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouse)
      document.removeEventListener('visibilitychange', handleVisibility)
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
