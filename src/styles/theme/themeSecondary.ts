import {createTheme} from '@mui/material/styles';
import {Shadows} from '@mui/material/styles/shadows';

import {Palette} from '@/styles/theme/theme';

const themeSecondary = createTheme({
  shadows: Array(25).fill('none') as Shadows,
  palette: {
    primary: {
      main: '#F85A3A',
      contrastText: '#EDE3E4',
    },
    secondary: {
      main: '#16363B',
    },
    error: {
      main: '#ef4565',
    },
  },
  typography: {
    fontFamily: [
      '"Noto Sans JP"',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontSize: '2.3rem',
      fontWeight: 700,
      color: '#0D1F22',
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 700,
      color: '#0D1F22',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#16363B',
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 500,
      color: '#16363B',
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 500,
      color: '#16363B',
    },
    h6: {
      fontSize: '1.2rem',
      fontWeight: 500,
      color: '#16363B',
    },
    subtitle1: {
      color: '#16363B',
    },
    subtitle2: {
      color: '#16363B',
    },
    body1: {
      color: '#2C333A',
    },
    body2: {
      color: '#2C333A',
    },
    caption: {
      fontSize: '0.9rem',
      color: '#2C333A',
    },
  },
});

const paletteSecondary: Palette = {
  headerBackgroundColor: themeSecondary.palette.primary.main,
  navTabsBackgroundColor: themeSecondary.palette.secondary.main,
  navTabsColor: themeSecondary.palette.primary.contrastText,
};

export {themeSecondary, paletteSecondary};
