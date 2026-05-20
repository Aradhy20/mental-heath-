import { createTheme, ThemeOptions } from '@mui/material/styles';

export const getMuiTheme = (mode: 'light' | 'dark') => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#A78BFA', // Lavender/Violet 400
        light: '#C4B5FD',
        dark: '#7C3AED',
        contrastText: '#ffffff',
      },
      secondary: {
        main: isLight ? '#F5F3FF' : '#1E1B4B', // Light lavender highlight
        contrastText: '#7C3AED',
      },
      background: {
        default: isLight ? '#F9FAFB' : '#030014',
        paper: isLight ? '#FFFFFF' : '#09090B',
      },
      text: {
        primary: isLight ? '#1F2937' : '#F9FAFB',
        secondary: isLight ? '#6B7280' : '#9CA3AF',
      },
      divider: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
    },
    typography: {
      fontFamily: 'var(--font-sans), sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      h2: { fontWeight: 800, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              backgroundColor: '#A78BFA',
              '&:hover': {
                backgroundColor: '#8B5CF6',
              },
            },
          },
        ],
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 24,
            backgroundColor: isLight ? '#FFFFFF' : '#09090B',
            border: isLight ? '1px solid rgba(0, 0, 0, 0.02)' : '1px solid rgba(255, 255, 255, 0.02)',
            boxShadow: isLight 
              ? '0 10px 40px -10px rgba(0, 0, 0, 0.04)'
              : '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
          },
        },
      },
    },
  });
};

// Default export for backward compatibility
export const muiTheme = getMuiTheme('light');
