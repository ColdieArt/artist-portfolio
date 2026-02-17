import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        abyss: '#080808',
        charcoal: '#111111',
        slate: '#1a1a1a',
        steel: '#666666',
        silver: '#999999',
        bone: '#cccccc',
        paper: '#e0e0e0',
        neon: {
          green: '#cccccc',
          blue: '#999999',
          magenta: '#888888',
          cyan: '#aaaaaa',
        },
        gold: '#999999',
        'gold-light': '#bbbbbb',
        redacted: '#000000',
      },
      fontFamily: {
        display: ['"Special Elite"', '"Courier New"', 'monospace'],
        mono: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
        body: ['"IBM Plex Mono"', '"Courier New"', 'monospace'],
        stencil: ['"Black Ops One"', '"Impact"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'glitch': 'glitch 0.3s ease-in-out',
        'scan': 'scan 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'flicker': 'flicker 4s linear infinite',
        'redact-reveal': 'redactReveal 0.6s ease-out forwards',
        'pixel-drift': 'pixelDrift 12s ease-in-out infinite',
        'pixel-drift-slow': 'pixelDrift 20s ease-in-out infinite',
        'pixel-drift-fast': 'pixelDrift 8s ease-in-out infinite',
        'vhs-tracking': 'vhsTracking 6s ease-in-out infinite',
        'grain-shift': 'grainShift 0.5s steps(4) infinite',
        'distort': 'distort 10s ease-in-out infinite',
        'typewriter': 'typewriter 2s steps(30) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        glitch: {
          '0%': { transform: 'translate(0)', filter: 'brightness(1)' },
          '20%': { transform: 'translate(-3px, 2px)', filter: 'brightness(1.5) contrast(2)' },
          '40%': { transform: 'translate(-2px, -3px)', filter: 'brightness(0.8)' },
          '60%': { transform: 'translate(3px, 1px)', filter: 'brightness(1.3) contrast(1.5)' },
          '80%': { transform: 'translate(2px, -2px)', filter: 'brightness(0.9)' },
          '100%': { transform: 'translate(0)', filter: 'brightness(1)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '3%': { opacity: '0.4' },
          '6%': { opacity: '1' },
          '7%': { opacity: '0.6' },
          '9%': { opacity: '1' },
          '50%': { opacity: '1' },
          '52%': { opacity: '0.7' },
          '53%': { opacity: '1' },
        },
        redactReveal: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        pixelDrift: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '25%': { transform: 'translate3d(8px, -12px, 20px)' },
          '50%': { transform: 'translate3d(-5px, 8px, -15px)' },
          '75%': { transform: 'translate3d(12px, 5px, 10px)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        vhsTracking: {
          '0%, 100%': { transform: 'translateX(0)', opacity: '1' },
          '10%': { transform: 'translateX(2px)', opacity: '0.9' },
          '30%': { transform: 'translateX(-1px)', opacity: '1' },
          '50%': { transform: 'translateX(3px)', opacity: '0.85' },
          '70%': { transform: 'translateX(-2px)', opacity: '1' },
        },
        grainShift: {
          '0%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-2%, 2%)' },
          '50%': { transform: 'translate(2%, -1%)' },
          '75%': { transform: 'translate(-1%, -2%)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        distort: {
          '0%, 100%': { transform: 'skewX(0deg) skewY(0deg)' },
          '25%': { transform: 'skewX(0.5deg) skewY(-0.3deg)' },
          '50%': { transform: 'skewX(-0.3deg) skewY(0.5deg)' },
          '75%': { transform: 'skewX(0.4deg) skewY(0.2deg)' },
        },
        typewriter: {
          '0%': { width: '0', borderRight: '2px solid white' },
          '99%': { borderRight: '2px solid white' },
          '100%': { width: '100%', borderRight: 'none' },
        },
      },
      backgroundImage: {
        'noise': "url('/images/noise.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}

export default config
