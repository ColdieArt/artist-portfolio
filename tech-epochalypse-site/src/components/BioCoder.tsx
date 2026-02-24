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
const TOTAL_LINES = 20
const SCROLL_SPEED = 0.6

// Redacted marquee config
const REDACTED_LINE_HEIGHT = 50
const REDACTED_TOTAL_LINES = 30
const REDACTED_SCROLL_SPEED = 1.8

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
    let graphData: number[] = []
    let redactionMap: number[] = []

    // Redacted marquee state
    let redactedScrollOffset = 0
    let redactedWordMap: number[][] = []

    // Glitch state
    let glitchActive = false
    let glitchStartTime = 0
    let glitchDuration = 0
    let nextGlitchTime = 2000 + Math.random() * 4000

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

    const initRedactedWordMap = () => {
      redactedWordMap = []
      for (let i = 0; i < REDACTED_TOTAL_LINES * 2; i++) {
        const phrase = allPhrases[i % allPhrases.length]
        const words = phrase.split(/(\s+)/).filter(w => w.length > 0)
        const actualWordIndices: number[] = []
        for (let j = 0; j < words.length; j++) {
          if (!/\s+/.test(words[j])) actualWordIndices.push(j)
        }
        const indices: number[] = []
        if (Math.random() < 0.6 && actualWordIndices.length > 0) {
          const numToRedact = Math.floor(Math.random() * Math.min(3, actualWordIndices.length)) + 1
          const startIdx = Math.floor(Math.random() * Math.max(1, actualWordIndices.length - numToRedact + 1))
          for (let k = 0; k < numToRedact; k++) {
            if (startIdx + k < actualWordIndices.length) {
              indices.push(actualWordIndices[startIdx + k])
            }
          }
        }
        redactedWordMap.push(indices)
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

      // ── Glitch state management ──
      if (!glitchActive && time > nextGlitchTime) {
        glitchActive = true
        glitchStartTime = time
        glitchDuration = 100 + Math.random() * 200
      }
      if (glitchActive && time - glitchStartTime > glitchDuration) {
        glitchActive = false
        nextGlitchTime = time + 2000 + Math.random() * 5000
      }

      const glitchProgress = glitchActive
        ? (time - glitchStartTime) / glitchDuration
        : 0

      // ── Main text - 5x size, left-justified, bottom-to-top scroll ──
      const fontSize = Math.max(55, Math.min(70, canvas.width / 20))
      ctx.font = `bold ${fontSize}px 'Courier New', monospace`
      ctx.textAlign = 'left'

      const leftPadding = 40

      // Scroll upward (bottom to top)
      scrollOffset -= SCROLL_SPEED
      const singleSetHeight = LINE_HEIGHT * TOTAL_LINES
      if (scrollOffset < -singleSetHeight) {
        scrollOffset += singleSetHeight
      }

      // Sine phase
      sinePhase += 0.003
      if (sinePhase > Math.PI * 2) sinePhase -= Math.PI * 2

      if (Math.random() < 0.005) {
        initGraphData()
      }

      // Draw scrolling lines - left aligned, bottom to top
      for (let i = 0; i < TOTAL_LINES * 2; i++) {
        const phraseIndex = i % allPhrases.length
        const line = allPhrases[phraseIndex]

        let yPos = i * LINE_HEIGHT + scrollOffset
        if (yPos < -singleSetHeight) yPos += singleSetHeight * 2
        if (yPos > canvas.height + LINE_HEIGHT) continue

        // Sine wave horizontal drift
        const xOffset = Math.sin(i * 0.5 + sinePhase) * 80
        // Vertical sine displacement
        const yWave = Math.sin(i * 0.3 + sinePhase * 1.5) * 15

        const drawX = leftPadding + xOffset
        const drawY = yPos + yWave

        // ── Glitch: monochrome channel split ──
        if (glitchActive) {
          const splitAmount = (4 + Math.random() * 8) * Math.sin(glitchProgress * Math.PI)
          const hDisplace = (Math.random() - 0.5) * 20 * Math.sin(glitchProgress * Math.PI)

          // Offset copy - lighter
          ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + Math.random() * 0.03})`
          ctx.fillText(line, drawX + hDisplace - splitAmount, drawY)
          // Offset copy - darker
          ctx.fillStyle = `rgba(255, 255, 255, ${0.03 + Math.random() * 0.02})`
          ctx.fillText(line, drawX + hDisplace + splitAmount, drawY)
        }

        // Main white text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.19)'
        ctx.fillText(line, drawX, drawY)

        // Opaque redaction bars - solid white, fully covers the word
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

            // Solid opaque white bar - completely covers the word
            ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
            ctx.fillRect(
              startX - 3,
              drawY - fontSize * 0.82,
              wordWidth + 6,
              fontSize * 1.05
            )
          }
        }

        // Data visualizations
        if (i % 5 === 0) {
          const animType = i % 3
          const animWidth = 200
          const animHeight = LINE_HEIGHT * 0.5
          const animX = canvas.width * 0.08 + (i * 47) % (canvas.width * 0.35)
          const animY = drawY - animHeight / 2

          ctx.save()
          ctx.beginPath()
          ctx.rect(animX, animY, animWidth, animHeight)
          ctx.clip()

          if (animType === 0 && graphData.length > 0) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.moveTo(animX, animY + animHeight)
            for (let j = 0; j < graphData.length; j++) {
              const x = animX + (j / (graphData.length - 1)) * animWidth
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
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.125)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            for (let j = 0; j < animWidth; j++) {
              const x = animX + j
              const y =
                animY +
                animHeight / 2 +
                Math.sin(sinePhase * 2 + j * 0.06) * (animHeight * 0.4)
              if (j === 0) ctx.moveTo(x, y)
              else ctx.lineTo(x, y)
            }
            ctx.stroke()
          } else {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            for (let j = 0; j < animWidth; j++) {
              const x = animX + j
              const t = j / animWidth
              let y = animY + animHeight / 2
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

      // ── Vertical marquee redacted text - left justified, bottom to top ──
      redactedScrollOffset -= REDACTED_SCROLL_SPEED
      const redactedSetHeight = REDACTED_LINE_HEIGHT * REDACTED_TOTAL_LINES
      if (redactedScrollOffset < -redactedSetHeight) {
        redactedScrollOffset += redactedSetHeight
      }

      const redactedFontSize = 20
      ctx.font = `bold ${redactedFontSize}px 'Courier New', monospace`
      ctx.textAlign = 'left'

      // Two columns on left and right edges
      const columns = [
        { x: 30, width: canvas.width * 0.22 },
        { x: canvas.width - canvas.width * 0.22 - 30, width: canvas.width * 0.22 },
      ]

      for (const col of columns) {
        ctx.save()
        ctx.beginPath()
        ctx.rect(col.x - 5, 0, col.width + 10, canvas.height)
        ctx.clip()

        for (let i = 0; i < REDACTED_TOTAL_LINES * 2; i++) {
          const phraseIdx = i % allPhrases.length
          const phrase = allPhrases[phraseIdx]
          const words = phrase.split(/(\s+)/).filter(w => w.length > 0)

          let yPos = i * REDACTED_LINE_HEIGHT + redactedScrollOffset
          if (yPos < -redactedSetHeight) yPos += redactedSetHeight * 2
          if (yPos > canvas.height + REDACTED_LINE_HEIGHT) continue

          // Sine wave horizontal drift
          const drift = Math.sin(i * 0.4 + sinePhase * 0.8) * 12

          // White text
          ctx.fillStyle = 'rgba(255, 255, 255, 0.10)'
          ctx.fillText(phrase, col.x + drift, yPos)

          // Opaque redaction bars - solid white, fully covers words
          const wordIndices = redactedWordMap[i] ?? []
          if (wordIndices.length > 0) {
            let currentX = col.x + drift
            for (let j = 0; j < words.length; j++) {
              const word = words[j]
              const wordWidth = ctx.measureText(word).width

              if (wordIndices.includes(j)) {
                // Solid opaque white bar
                ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
                ctx.fillRect(
                  currentX - 2,
                  yPos - redactedFontSize * 0.82,
                  wordWidth + 4,
                  redactedFontSize * 1.05
                )
              }
              currentX += wordWidth
            }
          }

          // Glitch on redacted columns
          if (glitchActive && Math.random() < 0.3) {
            const jumpX = (Math.random() - 0.5) * 30
            ctx.fillStyle = `rgba(255, 255, 255, ${0.04 + Math.random() * 0.06})`
            ctx.fillText(phrase, col.x + drift + jumpX, yPos)
          }
        }

        ctx.restore()
      }

      // ── Glitch: random scanline displacement ──
      if (glitchActive) {
        const numSlices = 3 + Math.floor(Math.random() * 5)
        for (let s = 0; s < numSlices; s++) {
          const sliceY = Math.random() * canvas.height
          const sliceH = 2 + Math.random() * 8
          const shiftX = (Math.random() - 0.5) * 40

          const imageData = ctx.getImageData(0, Math.floor(sliceY), canvas.width, Math.floor(sliceH))
          ctx.putImageData(imageData, Math.floor(shiftX), Math.floor(sliceY))
        }

        // Brief white flash
        if (Math.random() < 0.3) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.03})`
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
      }

      // Occasional scan line
      if (Math.random() > 0.97) {
        const scanY = (time * 0.05) % canvas.height
        ctx.fillStyle = 'rgba(255, 255, 255, 0.075)'
        ctx.fillRect(0, scanY, canvas.width, 3)
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    initRedactionMap()
    initRedactedWordMap()
    initGraphData()
    animationId = requestAnimationFrame(draw)

    const handleResize = () => {
      resize()
      initRedactionMap()
      initRedactedWordMap()
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
