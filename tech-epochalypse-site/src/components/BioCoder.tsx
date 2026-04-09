'use client'

import { useEffect, useRef } from 'react'

const DATA_COLLECTION_PHRASES = [
  'DATA HARVEST PROTOCOL ACTIVE',
  'USER CONSENT: NOT REQUIRED',
  'BROWSING HISTORY CATALOGUED',
  'KEYSTROKE LOGGER: DEPLOYED',
  'LOCATION PING: EVERY 30 SEC',
  'DEVICE MICROPHONE: LISTENING',
  'CAMERA ACCESS: GRANTED',
  'CONTACT LIST: EXFILTRATED',
  'PURCHASE RECORDS: COMPILED',
  'SEARCH QUERIES: ARCHIVED',
  'SOCIAL GRAPH: FULLY MAPPED',
  'METADATA EXTRACTION: ONGOING',
  'BEHAVIORAL MODEL: TRAINING',
  'PREDICTIVE SCORE: CALCULATED',
  'SHADOW PROFILE: CONSTRUCTED',
  'THIRD PARTY SHARING: ENABLED',
  'ENCRYPTION BACKDOOR: INSTALLED',
  'FACIAL TEMPLATE: ON FILE',
  'VOICE SIGNATURE: CAPTURED',
  'FINGERPRINT HASH: STORED',
  'BIOMETRIC DATABASE: UPDATED',
  'CROSS-DEVICE TRACKING: LINKED',
  'AD AUCTION: IDENTITY SOLD',
  'REAL-TIME BIDDING: YOUR DATA',
  'RETENTION PERIOD: INDEFINITE',
  'DELETION REQUEST: DENIED',
  'PRIVACY POLICY: 47 PAGES',
  'OPT-OUT: FUNCTIONALITY REMOVED',
  'COMPLIANCE STATUS: IRRELEVANT',
  'DATA BROKER TRANSFER: COMPLETE',
]

const SECURITY_PHRASES = [
  'FIREWALL BREACH DETECTED',
  'ZERO-DAY EXPLOIT ACTIVE',
  'ROOT ACCESS OBTAINED',
  'CREDENTIALS COMPROMISED',
  'SSL CERTIFICATE SPOOFED',
  'MAN-IN-THE-MIDDLE: ACTIVE',
  'PACKET INSPECTION: DEEP',
  'DNS POISONING: SUCCESSFUL',
  'BACKDOOR PORT: 31337 OPEN',
  'PRIVILEGE ESCALATION: ROOT',
  'INJECTION VECTOR: SQL',
  'BUFFER OVERFLOW: TRIGGERED',
  'RANSOMWARE PAYLOAD: STAGED',
  'ENDPOINT PROTECTION: BYPASSED',
  'INTRUSION DETECTION: EVADED',
]

const LINE_HEIGHT = 120
const TOTAL_LINES = 16
const SCROLL_SPEED = 0.6

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
    let redactionMap: number[] = []
    let lastFrameTime = 0
    const FRAME_INTERVAL = 1000 / 15 // 15fps — background text effect

    // Lightweight glitch: just text offset, no pixel manipulation
    let glitchActive = false
    let glitchStartTime = 0
    let glitchDuration = 0
    let nextGlitchTime = 3000 + Math.random() * 5000

    const allPhrases = [...DATA_COLLECTION_PHRASES, ...SECURITY_PHRASES]

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

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const draw = (time: number) => {
      animationId = requestAnimationFrame(draw)

      // Throttle to 15fps
      if (time - lastFrameTime < FRAME_INTERVAL) return
      lastFrameTime = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Lightweight glitch state
      if (!glitchActive && time > nextGlitchTime) {
        glitchActive = true
        glitchStartTime = time
        glitchDuration = 80 + Math.random() * 150
      }
      if (glitchActive && time - glitchStartTime > glitchDuration) {
        glitchActive = false
        nextGlitchTime = time + 3000 + Math.random() * 6000
      }

      const glitchProgress = glitchActive
        ? (time - glitchStartTime) / glitchDuration
        : 0

      // Main text
      const fontSize = Math.max(55, Math.min(70, canvas.width / 20))
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`
      ctx.textAlign = 'left'

      const leftPadding = 40

      // Scroll upward
      scrollOffset -= SCROLL_SPEED
      const singleSetHeight = LINE_HEIGHT * TOTAL_LINES
      if (scrollOffset < -singleSetHeight) {
        scrollOffset += singleSetHeight
      }

      // Sine phase
      sinePhase += 0.003
      if (sinePhase > Math.PI * 2) sinePhase -= Math.PI * 2

      // Draw scrolling lines
      for (let i = 0; i < TOTAL_LINES * 2; i++) {
        const phraseIndex = i % allPhrases.length
        const line = allPhrases[phraseIndex]

        let yPos = i * LINE_HEIGHT + scrollOffset
        if (yPos < -singleSetHeight) yPos += singleSetHeight * 2
        if (yPos > canvas.height + LINE_HEIGHT) continue

        // Sine wave horizontal drift
        const xOffset = Math.sin(i * 0.5 + sinePhase) * 80
        const yWave = Math.sin(i * 0.3 + sinePhase * 1.5) * 15

        const drawX = leftPadding + xOffset
        const drawY = yPos + yWave

        // Lightweight glitch: just offset text, no getImageData
        if (glitchActive) {
          const hDisplace = (Math.random() - 0.5) * 16 * Math.sin(glitchProgress * Math.PI)
          ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.02})`
          ctx.fillText(line, drawX + hDisplace, drawY)
        }

        // Main white text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.19)'
        ctx.fillText(line, drawX, drawY)

        // Redaction bars
        const redactWordIdx = redactionMap[i] ?? -1
        if (redactWordIdx >= 0) {
          const words = line.split(' ')
          if (redactWordIdx < words.length) {
            const textBefore = words.slice(0, redactWordIdx).join(' ')
            const redactedWord = words[redactWordIdx]
            const beforeWidth = textBefore
              ? ctx.measureText(textBefore + ' ').width
              : 0
            const wordWidth = ctx.measureText(redactedWord).width
            const startX = drawX + beforeWidth

            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
            ctx.fillRect(
              startX - 3,
              drawY - fontSize * 0.82,
              wordWidth + 6,
              fontSize * 1.05
            )
          }
        }
      }

      // Occasional scan line (very cheap)
      if (Math.random() > 0.97) {
        const scanY = (time * 0.05) % canvas.height
        ctx.fillStyle = 'rgba(255, 255, 255, 0.075)'
        ctx.fillRect(0, scanY, canvas.width, 3)
      }
    }

    resize()
    initRedactionMap()
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
