// MindfulAI Mobile — Ultra-Premium Design System
// MindfulAI Mobile — Ultra-Premium Design System (Light Mode)
export const COLORS = {
  background:  '#FAFAFA', // M3 Surface Light
  surface:     '#FFFFFF', // M3 Surface Container Light
  surfaceHighlight: '#F3F0F5',
  border:      '#E6E1E5', // M3 Outline Light
  borderHighlight: '#938F99',
  
  // Material 3 Primary / Violet (Light)
  primary:     '#7E22CE', 
  onPrimary:   '#FFFFFF',
  primaryContainer: '#F3E8FF',
  onPrimaryContainer: '#2E004F',
  
  secondary:   '#625B71',
  onSecondary: '#FFFFFF',
  
  text:        '#1C1B1F', // M3 On Surface Light
  textMuted:   '#79747E', // M3 Outline
  textSecond:  '#49454F', // M3 On Surface Variant Light
  
  // Semantic
  emerald:     '#10B981', 
  amber:       '#F59E0B', 
  rose:        '#EF4444', 
  cyan:        '#06B6D4',
  
  glassLight:  'rgba(0, 0, 0, 0.02)',
  glassMedium: 'rgba(0, 0, 0, 0.05)',
} as const

export const FONTS = {
  black:    '900' as const,
  bold:     '700' as const,
  semibold: '600' as const,
  medium:   '500' as const,
  regular:  '400' as const,
  light:    '300' as const,
}

export const RADIUS = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  '2xl': 32,
  '3xl': 40,
  full: 9999,
} as const

export const SPACING = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, '3xl': 32, '4xl': 48, '5xl': 64
} as const

export const SHADOWS = {
  sm: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0px 4px 8px rgba(0, 0, 0, 0.12)',
  lg: '0px 8px 16px rgba(0, 0, 0, 0.15)',
  glow: '0px 0px 20px rgba(139, 92, 246, 0.4)',
} as const
