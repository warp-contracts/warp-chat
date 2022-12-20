import './App.css';
import Chat from './pages/Chat';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme';
import { createContext } from 'react';
//@ts-ignore
import { WarpFactory, Warp, Contract } from 'warp-contracts/web';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';

interface WarpType {
  warp: Warp;
  chatContractId: string;
  chatNsContractId: string;
  wcnsContract: Contract;
  chatContractSourceId: string;
}

export const WarpContext = createContext<WarpType>({} as WarpType);
function App() {
  const warp = WarpFactory.forMainnet();
  const chatContractId = 'nKPexNKcaQwT4zOODaQYUNt5-bPiqIUi9DQ6dmP7-7A';
  const chatNsContractId = 'Wss7NAAIrvkF9fliWYWpEhJ7LTX_Fug22rIUWNbs02I';
  const chatContractSourceId = 'KT4-pPoKUspcR9xkcClXAUAC6JmU4x-5KknlzynEVNw';
  const wcnsContract = warp.contract(chatNsContractId);
  const warpContext = {
    warp,
    chatContractId,
    chatNsContractId,
    wcnsContract,
    chatContractSourceId,
  };
  return (
    <ChakraProvider theme={theme}>
      <WarpContext.Provider value={warpContext}>
        <Box className="App" bg="linear-gradient(180deg, #E4D5F7 0%, #D1B7F2 100%);" height="100vh">
          <Chat />
        </Box>
      </WarpContext.Provider>
    </ChakraProvider>
  );
}

export default App;
