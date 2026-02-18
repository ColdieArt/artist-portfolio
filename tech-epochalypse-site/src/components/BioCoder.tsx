'use client'

import { useEffect, useRef } from 'react'

const BIOMETRIC_PHRASES = [
  'HEART RATE: 72 BPM',
  'BLOOD PRESSURE: 120/80 mmHg',
  'TEMPERATURE: 98.6 F (37.0 C)',
  'DNA SEQUENCE: ATGCAGTACTGCA...',
  'RETINAL SCAN: POSITIVE MATCH',
  'VOICE PRINT: IDENTIFIED',
  'NEURAL ACTIVITY: ELEVATED',
  'BRAINWAVES: ALPHA DOMINANT',
  'SKELETAL DENSITY: NORMAL',
  'ORGAN FUNCTION: OPTIMAL',
  'ELECTROLYTES: BALANCED',
  'METABOLIC RATE: AVERAGE',
  'GENETIC MARKERS: PRESENT',
  'IMMUNE RESPONSE: ACTIVE',
  'CELLULAR REGENERATION: HIGH',
  'NEUROTRANSMITTER LEVELS: STABLE',
  'ENDOCRINE SYSTEM: FUNCTIONAL',
  'RESPIRATORY RATE: 16 BREATHS/MIN',
  'PULSE OXIMETRY: 98% SpO2',
  'GLUCOSE LEVELS: 90 mg/dL',
  'ADRENAL OUTPUT: NORMAL',
  'CIRCADIAN RHYTHM: REGULAR',
  'COGNITIVE PROCESSING: RAPID',
  'EMOTIONAL STATE: NEUTRAL',
  'SLEEP CYCLE: REM STAGE ACTIVE',
  'MUSCLE TENSION: LOW',
  'HORMONE PROFILE: STABLE',
  'TOXIN LEVELS: UNDETECTED',
  'ALLERGEN RESPONSE: NEGATIVE',
  'PAIN RECEPTORS: INACTIVE',
]

const SURVEILLANCE_PHRASES = [
  'SURVEILLANCE ACTIVE',
  'DATA COLLECTION IN PROGRESS',
  'BIOMETRIC SCAN INITIATED',
  'ENCRYPTED CHANNEL ESTABLISHED',
  'ANOMALY DETECTED',
  'NETWORK INTRUSION DETECTED',
  'DIGITAL FOOTPRINT TRACED',
  'INITIATING PROTOCOL SIGMA',
  'TRACEABILITY ENABLED',
  'SYSTEM INTEGRITY COMPROMISED',
]

const LINE_HEIGHT = 28
const TOTAL_LINES = 20
const SCROLL_SPEED = 0.4

export default function BioCoder() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let scrollOffset = 0
    let sinePhase = 0
    let lastHeartbeat = 0
    let graphData: number[] = []
    // Stable redaction map: maps line index to which word index to redact (or -1 for no redaction)
    let redactionMap: number[] = []

    const allPhrases = [...BIOMETRIC_PHRASES, ...SURVEILLANCE_PHRASES]

    const initRedactionMap = () => {
      redactionMap = []
      for (let i = 0; i < TOTAL_LINES * 2; i++) {
        const phraseIndex = i % allPhrases.length
        const words = allPhrases[phraseIndex].split(' ')
        if (Math.random() < 0.5 && words.length > 1) {
          redactionMap.push(Math.floor(Math.random() * words.length))
        } else {
          redactionMap.push(-1)
        }
      }
    }

    const initGraphData = () => {
      graphData = []
      for (let i = 0; i < 20; i++) {
        graphData.push(Math.random())
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const fontSize = Math.max(11, Math.min(14, canvas.width / 100))
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`
      ctx.textAlign = 'center'

      // Scroll
      scrollOffset -= SCROLL_SPEED
      const singleSetHeight = LINE_HEIGHT * TOTAL_LINES
      if (scrollOffset < -singleSetHeight) {
        scrollOffset += singleSetHeight
      }

      // Animate states
      sinePhase += 0.002
      if (sinePhase > Math.PI * 2) sinePhase -= Math.PI * 2

      if (Math.random() < 0.005) {
        initGraphData()
      }

      const isHeartbeat = time - lastHeartbeat > 5000
      if (isHeartbeat) lastHeartbeat = time

      // Draw scrolling biometric lines
      for (let i = 0; i < TOTAL_LINES * 2; i++) {
        const phraseIndex = i % allPhrases.length
        const line = allPhrases[phraseIndex]

        let yPos = i * LINE_HEIGHT + scrollOffset
        if (yPos < -singleSetHeight) yPos += singleSetHeight * 2
        if (yPos > canvas.height + LINE_HEIGHT) continue

        // Horizontal offset for variety
        const xOffset = Math.sin(i * 0.7 + sinePhase) * 40

        // Draw text in faint green
        ctx.fillStyle = 'rgba(0, 255, 0, 0.07)'
        ctx.fillText(line, canvas.width / 2 + xOffset, yPos)

        // Apply stable redaction
        const redactWordIdx = redactionMap[i] ?? -1
        if (redactWordIdx >= 0) {
          const words = line.split(' ')
          if (redactWordIdx < words.length) {
            const textBefore = words.slice(0, redactWordIdx).join(' ')
            const redactedWord = words[redactWordIdx]
            const totalWidth = ctx.measureText(line).width
            const beforeWidth = textBefore
              ? ctx.measureText(textBefore + ' ').width
              : 0
            const wordWidth = ctx.measureText(redactedWord).width
            const startX =
              canvas.width / 2 +
              xOffset -
              totalWidth / 2 +
              beforeWidth

            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)'
            ctx.fillRect(
              startX,
              yPos - LINE_HEIGHT * 0.7,
              wordWidth,
              LINE_HEIGHT * 0.85
            )
          }
        }

        // Occasional animated data visualizations alongside text
        if (i % 7 === 0) {
          const animType = i % 3
          const animWidth = 120
          const animHeight = LINE_HEIGHT * 0.7
          const animX = canvas.width * 0.1 + (i * 37) % (canvas.width * 0.3)
          const animY = yPos - animHeight / 2

          ctx.save()
          ctx.beginPath()
          ctx.rect(animX, animY, animWidth, animHeight)
          ctx.clip()

          if (animType === 0 && graphData.length > 0) {
            // Bar graph
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.06)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(animX, animY + animHeight)
            for (let j = 0; j < graphData.length; j++) {
              const x =
                animX + (j / (graphData.length - 1)) * animWidth
              const y =
                animY +
                animHeight -
                graphData[j] *
                  animHeight *
                  (0.8 + 0.2 * Math.sin(time * 0.0005))
              ctx.lineTo(x, y)
            }
            ctx.stroke()
          } else if (animType === 1) {
            // Sine wave
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)'
            ctx.lineWidth = 1
            ctx.beginPath()
            for (let j = 0; j < animWidth; j++) {
              const x = animX + j
              const y =
                animY +
                animHeight / 2 +
                Math.sin(sinePhase + j * 0.08) * (animHeight * 0.35)
              if (j === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.stroke()
          } else {
            // Heartbeat
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.06)'
            ctx.lineWidth = 1
            ctx.beginPath()
            for (let j = 0; j < animWidth; j++) {
              const x = animX + j
              const t = j / animWidth
              let y = animY + animHeight / 2
              // Flatline with spike
              if (t > 0.4 && t < 0.45) {
                y -= animHeight * 0.4
              } else if (t > 0.45 && t < 0.5) {
                y += animHeight * 0.25
              }
              if (j === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.stroke()
          }

          ctx.restore()
        }
      }

      // Occasional scan line
      if (Math.random() > 0.98) {
        const scanY = (time * 0.05) % canvas.height
        ctx.fillStyle = 'rgba(0, 255, 0, 0.03)'
        ctx.fillRect(0, scanY, canvas.width, 2)
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    initRedactionMap()
    initGraphData()
    animationId = requestAnimationFrame(draw)

    const handleResize = () => {
      resize()
      initRedactionMap()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8, mixBlendMode: 'screen' }}
    />
  )
}
