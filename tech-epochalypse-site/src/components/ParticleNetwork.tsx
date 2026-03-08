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
    const CONNECTION_DISTANCE_SQ = 120 * 120 // Squared to avoid sqrt
    const MOUSE_DISTANCE_SQ = 180 * 180
    const MOUSE = { x: -1000, y: -1000 }
    let time = 0
    let lastFrameTime = 0
    const FRAME_INTERVAL = 1000 / 20 // Cap at 20fps for background effect
    let isVisible = true

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

      // Draw connections - use squared distance to avoid sqrt
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy

          if (distSq < CONNECTION_DISTANCE_SQ) {
            const alpha = (1 - Math.sqrt(distSq) / 120) * 0.06
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
          const alpha = (1 - Math.sqrt(mDistSq) / 180) * 0.15
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(MOUSE.x, MOUSE.y)
          ctx.stroke()
        }
      }

      // Draw particles
      for (const p of particles) {
        const parallaxX = Math.sin(time + p.z * 0.02) * (p.z * 0.15)
        const parallaxY = Math.cos(time * 0.7 + p.z * 0.03) * (p.z * 0.1)
        const drawX = p.x + parallaxX
        const drawY = p.y + parallaxY

        if (p.isPixelBlock) {
          const flicker = Math.sin(time * 3 + p.z) > 0.7 ? 0.15 : p.opacity * 0.6
          ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`
          ctx.fillRect(
            Math.round(drawX / 4) * 4,
            Math.round(drawY / 4) * 4,
            p.blockW,
            p.blockH
          )
        } else {
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

    const loop = (timestamp: number) => {
      if (!isVisible) return
      animationId = requestAnimationFrame(loop)

      // Throttle to 20fps
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
    window.addEventListener('mousemove', handleMouse)
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
