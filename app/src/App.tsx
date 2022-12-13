import './App.css';
import Chat from './pages/Chat';
import { ChakraProvider, Box } from '@chakra-ui/react';
import theme from './theme';
import { createContext } from 'react';
//@ts-ignore
import { WarpFactory, Warp, Contract } from 'warp-contracts/web';
import '@fontsource/noto-sans-phoenician';

interface WarpType {
  warp: Warp;
  chatContractId: string;
  chatNsContractId: string;
  contract: Contract;
  wcnsContract: Contract;
}

export const WarpContext = createContext<WarpType>({} as WarpType);
function App() {
  const warp = WarpFactory.forMainnet();
  const chatContractId = 'nKPexNKcaQwT4zOODaQYUNt5-bPiqIUi9DQ6dmP7-7A';
  const chatNsContractId = 'xjPIxVcjwKcqaICCL20AJFqNk6OUtlRQ_VyhvXmp1LQ';
  const contract = warp.contract(chatContractId);
  const wcnsContract = warp.contract(chatNsContractId);
  const warpContext = {
    warp,
    chatContractId,
    contract,
    chatNsContractId,
    wcnsContract,
  };
  return (
    <ChakraProvider theme={theme}>
      <WarpContext.Provider value={warpContext}>
        <Box className="App" bg="yellow" height="100vh">
          <Chat />
        </Box>
      </WarpContext.Provider>
    </ChakraProvider>
  );
}

export default App;
