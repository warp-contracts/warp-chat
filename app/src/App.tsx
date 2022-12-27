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
  chatNsContractId: string;
  wcnsContract: Contract;
  chatContractSourceId: string;
}

export const WarpContext = createContext<WarpType>({} as WarpType);
function App() {
  const warp = WarpFactory.forMainnet();
  const chatNsContractId = '333LXdvZj2zFI91iM3N_6i17NUafPmODC3xVyOBNotE';
  const chatContractSourceId = 'ECGca2deZcyg9_wLJX-2vc3oBDopXLwUeuJs0J-h0Qo';
  const wcnsContract = warp.contract(chatNsContractId);
  const warpContext = {
    warp,
    chatNsContractId,
    wcnsContract,
    chatContractSourceId,
  };
  return (
    <ChakraProvider theme={theme}>
      <WarpContext.Provider value={warpContext}>
        <Box className="App" bg="pinkgrad" height="100vh">
          <Chat />
        </Box>
      </WarpContext.Provider>
    </ChakraProvider>
  );
}

export default App;
