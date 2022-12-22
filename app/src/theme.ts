import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    green: '#4BFFA9;',
    lightpurple: '#D7A1F9',
    lightpink: '#FFDBE9',
    buttonblue: '#240070',
    pinkgrad: 'linear-gradient(180deg, #E4D5F7 0%, #D1B7F2 100%);',
    yellowgrad: 'linear-gradient(180deg, #FEFFC7 0%, #FDFFA6 100%);',
    lightpinkgrad: 'linear-gradient(180deg, #F4E7F9 0%, #EED9F5 100%);',
    verylightpink: '#EDDCF3',
    verylightpinkgrad: 'linear-gradient(180deg, #FEFFC7 0%, #FDFFA6 100%), #FEFFA7',
    grey: '#2E6B64',
    lime: '#E2FFBE',
    lightgrey: '#797979',
    purple: '#604297',
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
