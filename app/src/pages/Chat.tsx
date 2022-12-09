import './Chat.css';
import { Box } from '@chakra-ui/react';
import { Table, Tbody, Tr, Td, TableContainer } from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import { subscribe, initPubSub } from 'warp-contracts-pubsub';
import { Input } from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import { WarpContext } from '../App';
import MainButton from '../components/MainButton/MainButton';
import { useToast } from '@chakra-ui/react';

initPubSub();

function Chat() {
  const { contract, contractId } = useContext(WarpContext);
  const toast = useToast({
    containerStyle: {
      border: '1px solid #E53E3E',
      backgroundColor: '#E53E3E',
      marginTop: '15px',
    },
  });

  const [walletAddress, setWalletAddress] = useState<any>('');
  const [messages, setMessages] = useState([]);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    async function fetchContractState() {
      const response = await fetch(`https://dre-1.warp.cc/contract?id=${contractId}`).then((res) => {
        return res.json();
      });
      setMessages(response.state.messages);
    }
    fetchContractState();
  }, []);

  useEffect(() => {
    async function doSubscribe() {
      await subscribe(
        `states/${contractId}`,
        ({ data }: any) => setMessages(JSON.parse(data).state.messages),
        console.error
      );
    }
    doSubscribe();
  }, []);

  async function onSubmit(values: any) {
    try {
      await contract.writeInteraction({ function: 'write', content: values.name });
    } catch (e) {
      toast({
        title: 'Wallet not connected.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
    reset();
  }

  async function handleConnectWallet() {
    console.log(window);
    const wallet = new ArweaveWebWallet();

    wallet.setUrl('arweave.app');
    await wallet.connect();
    contract.connect('use_wallet');
    const address = wallet.namespaces.arweaveWallet.getActiveAddress();
    console.log(wallet);
    setWalletAddress(address);
  }

  return (
    <Box p={5} height="100%">
      <Box mb={3} display="flex" justifyContent="space-between">
        <MainButton>Create new channel</MainButton>
        {walletAddress ? (
          <Box>
            <Box color="blue">{walletAddress}</Box>
          </Box>
        ) : (
          <MainButton handleClick={handleConnectWallet}>Connect wallet</MainButton>
        )}
      </Box>
      <Box display="flex" width="100%" height="90%">
        <TableContainer width="25%" bg="orange" boxShadow="4px 4px black">
          <Table variant="simple">
            <Tbody>
              <Tr>
                <Td>Public</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Box width="75%" position="relative" bg="purple" ml={5} pr={5} boxShadow="4px 4px black">
          <Box
            overflowY="auto"
            height="82%"
            px={10}
            mt={10}
            display="flex"
            flexDirection="column-reverse"
            css={{
              '&::-webkit-scrollbar': {
                width: '10px',
              },
              '&::-webkit-scrollbar-track': {
                width: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'white',
                borderRadius: 'none',
              },
            }}
          >
            <Box
              //   overflowY="scroll"

              width="100%"
              //   display="flex"
              //   justifyContent="flex-end"
              //   flexDirection="column"
            >
              {messages &&
                messages.map((m: any) => {
                  return (
                    // return walletAddress == m.creator ? (
                    <Box key={m.id} bg="green" p={2} boxShadow="7px 5px black" mb={4}>
                      <Box color="black" fontSize="x-small" fontWeight="500">
                        {m.creator}
                      </Box>
                      {m.content}
                    </Box>
                  );
                  // ) : (
                  //   <Box key={m.id} bg="darkgreen" p={2} boxShadow="7px 5px black" mb={4}>
                  //     <Box color="black" fontSize="x-small" fontWeight="500">
                  //       {m.creator}
                  //     </Box>
                  //     {m.content}
                  //   </Box>
                  // );
                })}
            </Box>
          </Box>
          <Box position="absolute" bottom={0} width="100%" p={4}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <FormControl isRequired mr={5}>
                  <Input
                    bg="white"
                    borderRadius="none"
                    color="black"
                    id="message"
                    placeholder="Write your message"
                    {...register('name')}
                  />
                  {/* <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage> */}
                </FormControl>
                <MainButton size="md">Send</MainButton>
              </Box>
            </form>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;
