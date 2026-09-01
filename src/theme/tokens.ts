/**
 * El Stylo Salón — Design Tokens
 *
 * Centralised colour palette, spacing, radii, typography and shadows
 * inspired by the brand's architectural facade.
 */

export const colors = {
  /** Warm off-white background */
  background: '#F7F5F0',
  /** Card / panel surface */
  surface: '#FFFFFF',
  /** Muted surface for secondary cards */
  surfaceMuted: '#E7E5E0',
  /** Primary text — deep graphite */
  graphite: '#242526',
  /** Warm brown (walnut) — secondary emphasis */
  walnut: '#4A3328',
  /** Olive-gold accent — brand colour */
  oliveGold: '#9A9654',
  /** Light sage for subtle background accents */
  paleSage: '#E7E9DA',
  /** Positive / completed */
  success: '#667A4C',
  /** Caution / awaiting */
  warning: '#B88444',
  /** Destructive / danger */
  danger: '#A3453D',
  /** Subtle borders */
  border: '#D8D4CB',

  /* Derived / UI helpers */
  /** Overlay for modals */
  overlay: 'rgba(36, 37, 38, 0.55)',
  /** Disabled elements */
  disabled: '#C2BFBA',
  /** Placeholder text */
  placeholder: '#9E9B96',
  /** Icon default colour */
  icon: '#6B6966',
  /** Active tab / selected */
  tabActive: '#4A3328',
  /** Inactive tab */
  tabInactive: '#9E9B96',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const typography = {
  fontFamily: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  /* Use system fallback when fonts haven't loaded yet */
  fontFamilyFallback: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  sizes: {
    caption: 11,
    footnote: 12,
    subheadline: 13,
    body: 15,
    callout: 16,
    headline: 17,
    title3: 20,
    title2: 22,
    title1: 28,
    largeTitle: 34,
  },
  lineHeights: {
    caption: 14,
    footnote: 16,
    subheadline: 18,
    body: 20,
    callout: 22,
    headline: 22,
    title3: 26,
    title2: 28,
    title1: 34,
    largeTitle: 42,
  },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#242526',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#242526',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#242526',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/** Appointment-state colour mapping */
export const appointmentStateColors: Record<string, { bg: string; text: string; border: string }> = {
  pendiente: { bg: '#FFF4E6', text: '#B88444', border: '#EED9B5' },
  confirmada: { bg: '#EFF5E8', text: '#667A4C', border: '#C7DAB3' },
  reprogramacion_propuesta: { bg: '#EDE9FA', text: '#7B6BA8', border: '#D5CCF0' },
  rechazada: { bg: '#FCEAE8', text: '#A3453D', border: '#EFC6C2' },
  cancelada: { bg: '#F3F1EE', text: '#9E9B96', border: '#D8D4CB' },
  completada: { bg: '#E7E9DA', text: '#4A3328', border: '#C8CBB8' },
  no_asistio: { bg: '#FCEAE8', text: '#A3453D', border: '#EFC6C2' },
};

export const theme = {
  colors,
  spacing,
  radii,
  typography,
  shadows,
  appointmentStateColors,
} as const;

export type Theme = typeof theme;
