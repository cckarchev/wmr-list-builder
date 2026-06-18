// Shared RGB channels — the single source of truth for every color in the app.
// Compose them at any opacity with `alpha()` instead of hardcoding rgba() strings.
const rgb = {
  text: '243,247,248',
  white: '255,255,255',
  black: '0,0,0',
  accent: '212,98,62',
  teal: '43,179,196',
  panel: '13,26,31',
} as const;

const alpha = (channels: string, a: number) => `rgba(${channels},${a})`;

export const theme = {
  rgb,
  alpha,
  color: {
    bg: {
      base: '#0a1a22',
      surface: '#0d1f28',
      tint: '#15303a',
      deep: '#070e12',
      panel: alpha(rgb.panel, 0.6),
    },
    accent: '#d4623e',
    accentInk: '#091418',
    teal: '#1e6b78',
    tealBright: '#2bb3c4',
    text: {
      strong: alpha(rgb.text, 1),
      body: alpha(rgb.text, 0.72),
      dim: alpha(rgb.text, 0.45),
    },
    border: {
      divider: alpha(rgb.white, 0.08),
      default: alpha(rgb.white, 0.12),
      hover: alpha(rgb.white, 0.18),
      focus: alpha(rgb.white, 0.24),
      active: alpha(rgb.white, 0.5),
      accent: alpha(rgb.accent, 0.65),
    },
    // Ghost / teal-outline interactive states (e.g. the ghost Button variant).
    ghost: {
      border: alpha(rgb.teal, 0.45),
      borderHover: alpha(rgb.teal, 0.75),
      bg: alpha(rgb.teal, 0.08),
    },
    semantic: { error: '#e05555', success: '#46af73', warning: '#d9b770' },
  },
  space: [0, 4, 8, 12, 16, 24, 32, 48, 64] as const,
  radius: { sm: '0', md: '0', lg: '0', pill: '0' },
  fontSize: { xs: '12px', sm: '14px', md: '16px', lg: '20px', xl: '28px', xxl: '40px' },
  font: {
    display: "'Oswald', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  tracking: { label: '0.2em', labelWide: '0.28em', button: '0.12em' },
  shadow: { panel: '0 2px 8px rgba(0,0,0,0.35)' },
  breakpoint: { sm: '480px', md: '768px', lg: '1024px' },
} as const;

export type AppTheme = typeof theme;
