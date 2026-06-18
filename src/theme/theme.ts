export const theme = {
  color: {
    bg: { base: '#0a1a22', surface: '#0d1f28', tint: '#15303a', deep: '#070e12' },
    accent: '#d4623e',
    accentInk: '#091418',
    teal: '#1e6b78',
    tealBright: '#2bb3c4',
    text: {
      strong: 'rgba(243,247,248,1)',
      body: 'rgba(243,247,248,0.72)',
      dim: 'rgba(243,247,248,0.45)',
    },
    border: {
      divider: 'rgba(255,255,255,0.08)',
      default: 'rgba(255,255,255,0.12)',
      hover: 'rgba(255,255,255,0.18)',
      active: 'rgba(255,255,255,0.5)',
      accent: 'rgba(212,98,62,0.65)',
    },
    semantic: { error: '#e05555', success: '#46af73', warning: '#d9b770' },
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64] as const,
  radius: { sm: '4px', md: '8px', lg: '14px', pill: '999px' },
  fontSize: { xs: '12px', sm: '14px', md: '16px', lg: '20px', xl: '28px', xxl: '40px' },
  font: {
    display: "'Oswald', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  shadow: { panel: '0 2px 8px rgba(0,0,0,0.35)' },
  breakpoint: { sm: '480px', md: '768px', lg: '1024px' },
} as const;

export type AppTheme = typeof theme;
