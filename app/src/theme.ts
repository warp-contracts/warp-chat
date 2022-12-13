import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    orange: '#ff99d9',
    yellow: '#f7fc55',
    green: '#50ffaf',
    blue: '#6880fe',
    purple: '#9b7cf9',
    darkgreen: '#008000',
    lightpurple: '#D7A1F9',
  },
  fonts: {
    body: `'Noto Sans Phoenician', sans-serif`,
  },
  components: {
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: 'lightpurple',
          color: 'white',
        },
      }),
    },
  },
});

export default theme;
