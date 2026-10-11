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

// Opacity per token, grouped like the color tokens below so each ladder reads
// at a glance. Keys match the token they feed.
const BG_OPACITY = {
  panel: 0.6,
  accentTint: 0.15,
  stripe: 0.06,
  scrim: 0.6,
} as const;

const TEXT_OPACITY = {
  strong: 1,
  body: 0.82,
  dim: 0.62,
} as const;

const BORDER_OPACITY = {
  divider: 0.14,
  default: 0.22,
  hover: 0.34,
  focus: 0.85,
  active: 0.65,
  accent: 0.7,
} as const;

const GHOST_OPACITY = {
  border: 0.6,
  borderHover: 0.9,
  bg: 0.1,
} as const;

export const theme = {
  rgb,
  alpha,
  color: {
    bg: {
      base: '#0a1a22',
      surface: '#0d1f28',
      tint: '#15303a',
      deep: '#070e12',
      panel: alpha(rgb.panel, BG_OPACITY.panel),
      // Fill behind active accent controls, such as the selected roster filter.
      accentTint: alpha(rgb.accent, BG_OPACITY.accentTint),
      // Alternate-row shading for printed tables.
      stripe: alpha(rgb.white, BG_OPACITY.stripe),
      // Backdrop that dims the page behind a modal dialog.
      scrim: alpha(rgb.black, BG_OPACITY.scrim),
    },
    accent: '#d4623e',
    accentInk: '#091418',
    teal: '#1e6b78',
    tealBright: '#2bb3c4',
    // Text alphas run higher than the cckarchev marketing site: a dense builder
    // with small mono labels needs more contrast than a sparse landing page.
    text: {
      strong: alpha(rgb.text, TEXT_OPACITY.strong),
      body: alpha(rgb.text, TEXT_OPACITY.body),
      dim: alpha(rgb.text, TEXT_OPACITY.dim),
    },
    // Control-edge alphas are likewise bumped so panels, steppers and dividers
    // actually read as bordered controls against the near-black surfaces.
    border: {
      divider: alpha(rgb.white, BORDER_OPACITY.divider),
      default: alpha(rgb.white, BORDER_OPACITY.default),
      hover: alpha(rgb.white, BORDER_OPACITY.hover),
      focus: alpha(rgb.teal, BORDER_OPACITY.focus),
      active: alpha(rgb.white, BORDER_OPACITY.active),
      accent: alpha(rgb.accent, BORDER_OPACITY.accent),
    },
    // Ghost / teal-outline interactive states (e.g. the ghost Button variant).
    ghost: {
      border: alpha(rgb.teal, GHOST_OPACITY.border),
      borderHover: alpha(rgb.teal, GHOST_OPACITY.borderHover),
      bg: alpha(rgb.teal, GHOST_OPACITY.bg),
    },
    semantic: { error: '#e05555', success: '#46af73', warning: '#d9b770' },
  },
  // 4px-based spacing scale, in px. Names follow the fontSize scale.
  space: {
    none: 0,
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
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
  // Max content width for centered page containers; beyond this the layout
  // gutters rather than letting cards sprawl on large screens.
  layout: { maxWidth: '1200px' },
} as const;

export type AppTheme = typeof theme;
