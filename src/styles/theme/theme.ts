import {grey} from '@mui/material/colors';
import {createTheme} from '@mui/material/styles';

const theme = createTheme({
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
    },
    h2: {
      fontSize: '1.7rem',
      fontWeight: 700,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.2rem',
      fontWeight: 700,
    },
    h5: {
      fontSize: '1.2rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1.2rem',
      fontWeight: 700,
    },
    caption: {
      fontSize: '0.9rem',
      color: grey[700],
    },
  },
});

export {theme};
