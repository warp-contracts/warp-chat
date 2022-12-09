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
  contractId: string;
  contract: Contract;
}

export const WarpContext = createContext<WarpType>({} as WarpType);
function App() {
  const warp = WarpFactory.forMainnet();
  const contractId = 'ukqDPWEpRDNBb0--8SLqPxhB6Ph3XY-liOUr5SmHg08';
  const contract = warp.contract(contractId);
  const warpContext = {
    warp,
    contractId,
    contract,
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
