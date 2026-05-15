import type { Config } from 'tailwindcss'

// Design tokens extraídos dos HTMLs originais de design
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    '../../apps/store/src/**/*.{ts,tsx}',
    '../../apps/admin/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ──────────────────────────────────────────
        brand: {
          orange:     '#F26B1F',
          'orange-600': '#D9551A',
          'orange-100': '#FCE6D6',
          teal:       '#1FB5A8',
          'teal-600': '#168A80',
          'teal-100': '#D2F1ED',
          green:      '#2CB35A',
          yellow:     '#FFC83A',
          red:        '#E23B3B',
        },
        // ── Ink scale ──────────────────────────────────────
        ink: {
          950: '#0B0E12',
          900: '#14181F',
          800: '#1F252E',
          700: '#2A323D',
          600: '#4A5462',
          500: '#6B7280',
          400: '#9AA3AF',
          300: '#C4CAD2',
          200: '#E2E5EA',
          100: '#F1F3F6',
          50:  '#F8F9FB',
        },
      },
      fontFamily: {
        stencil: ['Bebas Neue', 'Archivo Black', 'sans-serif'],
        display: ['Archivo Black', 'Archivo', 'system-ui', 'sans-serif'],
        body:    ['Archivo', 'system-ui', 'sans-serif'],
        ui:      ['Space Grotesk', 'Archivo', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs:   '4px',
        sm:   '6px',
        md:   '10px',
        lg:   '16px',
        xl:   '22px',
        pill: '999px',
      },
      boxShadow: {
        xs:   '0 1px 2px rgba(11,14,18,.06)',
        sm:   '0 1px 3px rgba(11,14,18,.08), 0 1px 2px rgba(11,14,18,.04)',
        md:   '0 4px 12px rgba(11,14,18,.08), 0 2px 4px rgba(11,14,18,.04)',
        lg:   '0 12px 32px rgba(11,14,18,.12), 0 4px 8px rgba(11,14,18,.06)',
        glow: '0 0 0 4px rgba(242,107,31,.18)',
      },
      spacing: {
        '4.5': '18px',
        '13': '52px',
        '18': '72px',
        '22': '88px',
      },
    },
  },
  plugins: [],
}

export default config
