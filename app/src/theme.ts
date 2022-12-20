import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    orange: '#ff99d9',
    yellow: '#f7fc55',
    green: '#9AFFAA;',
    blue: '#6880fe',
    purple: '#9b7cf9',
    darkgreen: '#008000',
    lightpurple: '#D7A1F9',
    lightpink: '#FFDBE9',
    buttonblue: '#240070',
  },
  fonts: {
    body: 'Poppins',
  },
  styles: {
    global: {
      'html, body': {
        color: '#004E70',
      },
    },
  },
  components: {
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: 'linear-gradient(180deg, #F4E7F9 0%, #EED9F5 100%);',
          color: '#240070',
          borderRadius: '4px',
        },
      }),
    },
  },
});

export default theme;
