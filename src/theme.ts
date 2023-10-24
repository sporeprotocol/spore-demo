import { MantineThemeOverride } from '@mantine/core';
import { Poppins, Kulim_Park } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
});
const kulimPark = Kulim_Park({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const baseTheme: MantineThemeOverride = {
  colorScheme: 'light',
  primaryShade: 0,
  breakpoints: {
    xs: '30em',
    sm: '48em',
    md: '64em',
    lg: '80em',
    xl: '90em',
  },
  colors: {
    brand: ['#FCEB71', '#6D57CB'],
    background: ['#FFFDDD', '#F4F5F9', '#FFFFFF'],
    functional: ['#BB4747', '#20A555'],
    text: ['#1A202C', '#5D626B', '#8A8E95', '#FFFFFF'],
    border: ['#CDCFD5'],
    overlay: ['#E0E0E0'],
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
  fontFamily: `${kulimPark.style.fontFamily}, sans-serif`,
  headings: {
    fontFamily: `${poppins.style.fontFamily}, sans-serif`,
    sizes: {
      h1: {
        fontSize: '48px',
        fontWeight: 'bold',
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '32px',
        fontWeight: 'bold',
        lineHeight: 1.3,
      },
      h3: {
        fontSize: '24px',
        fontWeight: 'bold',
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '20px',
        fontWeight: 'bold',
        lineHeight: 1.3,
      },
      h5: {
        fontSize: '18px',
        fontWeight: 'bold',
        lineHeight: 1.3,
      },
    },
  },
};

const components: MantineThemeOverride['components'] = {
  Button: {
    defaultProps: (theme) => ({
      sx: {
        height: '48px',
        minWidth: '130px',
        padding: '12px 24px',
        fontSize: '16px',
        fontFamily: `${poppins.style.fontFamily}, sans-serif`,
        fontWeight: 600,
        lineHeight: 1.2,
        borderRadius: '8px',
        boxShadow: '4px 4px 0 #111318',
        position: 'relative',
        left: '-4px',

        '&:disabled': {
          color: theme.white,
          background: theme.colors.text[2],
        },
      },
    }),
  },
  Checkbox: {
    defaultProps: (theme) => ({
      styles: {
        input: {
          '&:checked': {
            backgroundColor: theme.colors.brand[1],
          },
        },
      },
    }),
  },
};

const theme = {
  ...baseTheme,
  components,
};

export default theme;
