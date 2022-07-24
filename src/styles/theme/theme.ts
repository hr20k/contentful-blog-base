import {grey} from '@mui/material/colors';
import {createTheme} from '@mui/material/styles';
import {Shadows} from '@mui/material/styles/shadows';

const theme = createTheme({
  shadows: Array(25).fill('none') as Shadows,
  palette: {
    primary: {
      main: '#3da9fc',
      contrastText: '#fffffe',
    },
    secondary: {
      main: '#90b4ce',
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
      color: '#094067',
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 700,
      color: '#094067',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#094067',
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 500,
      color: '#094067',
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 500,
      color: '#094067',
    },
    h6: {
      fontSize: '1.2rem',
      fontWeight: 500,
      color: '#094067',
    },
    subtitle1: {
      color: '#094067',
    },
    subtitle2: {
      color: '#094067',
    },
    body1: {
      color: '#5f6c7b',
    },
    body2: {
      color: '#5f6c7b',
    },
    caption: {
      fontSize: '0.9rem',
      color: '#5f6c7b',
    },
  },
});

export {theme};
