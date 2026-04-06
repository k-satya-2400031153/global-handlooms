/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        background: '#050505',
        surface: 'rgba(255, 255, 255, 0.04)',
        surfaceBorder: 'rgba(255, 255, 255, 0.09)',
        cyberCyan: '#00f0ff',
        neonIndigo: '#6366f1',
        alertRed: '#ff003c',
        neonGreen: '#00ff94',
        neonPink: '#ff0099',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        'cyber-gradient': 'linear-gradient(135deg, #00f0ff, #6366f1)',
        'danger-gradient': 'linear-gradient(135deg, #ff003c, #ff6b6b)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0,240,255,0.4), 0 0 60px rgba(0,240,255,0.15)',
        'neon-indigo': '0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.15)',
        'neon-red': '0 0 20px rgba(255,0,60,0.4), 0 0 60px rgba(255,0,60,0.15)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
      },
      animation: {
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow':          'glow 2s ease-in-out infinite alternate',
        'border-flow':   'borderFlow 3s linear infinite',
        'float':         'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'scan':          'scanBar 5s linear infinite',
        'shimmer':       'shimmer 2.5s linear infinite',
        'fade-in-up':    'fadeInUp 0.6s ease both',
        'glitch':        'glitch 3s infinite',
        'spin-slow':     'spin 8s linear infinite',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 10px rgba(0,240,255,0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(0,240,255,0.8), 0 0 50px rgba(99,102,241,0.5)' },
        },
        borderFlow: {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeInUp: {
          '0%':   { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)', clipPath: 'none' },
          '91%': { transform: 'translate(-2px, 1px)', clipPath: 'inset(20% 0 60% 0)' },
          '92%': { transform: 'translate(2px, -1px)', clipPath: 'inset(60% 0 10% 0)' },
          '93%': { transform: 'translate(0)', clipPath: 'none' },
        },
        scanBar: {
          '0%':   { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
    },
  },
  plugins: [],
}