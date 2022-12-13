import './Chat.css';
import { Box } from '@chakra-ui/react';
import { Table, Tbody, Tr, Td, TableContainer } from '@chakra-ui/react';
import { useState, useEffect, useContext, useRef } from 'react';
import { subscribe, initPubSub } from 'warp-contracts-pubsub';
import { Input } from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import { WarpContext } from '../App';
import MainButton from '../components/MainButton/MainButton';
import { useToast } from '@chakra-ui/react';
import Wallet from '../components/Wallet/Wallet';
import { evmSignature } from 'warp-contracts-plugin-signature';
import MainForm from '../components/Input/MainForm';
import RegisterName from '../components/RegisterName/RegisterName';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useVirtualizer } from '@tanstack/react-virtual';

initPubSub();

function Chat() {
  const { contract, chatContractId, chatNsContractId, wcnsContract } = useContext(WarpContext);
  const toast = useToast({
    containerStyle: {
      border: '1px solid #E53E3E',
      backgroundColor: '#E53E3E',
      marginTop: '15px',
    },
  });

  const [wallet, setWallet] = useState<any>({ address: '', signatureType: '', name: '' });
  const [messages, setMessages] = useState([]);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [registrationNameModalOpen, setRegistrationNameModalOpen] = useState(false);
  const [wcnsButton, setWcnsButton] = useState(false);
  const [wcnsState, setWcnsState] = useState(false);
  const parentRef = useRef();

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm();

  useEffect(() => {
    async function fetchContractState() {
      const response = await fetch(`https://dre-1.warp.cc/contract?id=${chatContractId}`).then((res) => {
        return res.json();
      });
      setMessages(response.state.messages);
    }
    fetchContractState();
  }, []);

  useEffect(() => {
    async function fetchWcnsContractState() {
      const response = await fetch(`https://dre-1.warp.cc/contract?id=${chatNsContractId}`).then((res) => {
        return res.json();
      });
      setWcnsState(response.state);
    }
    fetchWcnsContractState();
  }, [wallet]);

  useEffect(() => {
    async function doSubscribe() {
      await subscribe(
        `states/${chatContractId}`,
        ({ data }: any) => setMessages(JSON.parse(data).state.messages),
        console.error
      );
    }
    doSubscribe();
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    rowVirtualizer.scrollToIndex(messages.length);
  }, [messages]);

  async function onSubmit(values: any) {
    try {
      if (values.message.length > 280) {
        toast({
          title: 'Message too long.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
      await contract.writeInteraction({ function: 'write', content: values.message });
    } catch (e) {
      console.log(e);
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

  async function handleArweaveApp() {
    const wallet = new ArweaveWebWallet();

    wallet.setUrl('arweave.app');
    await wallet.connect();
    contract.connect('use_wallet');
    const address = wallet.namespaces.arweaveWallet.getActiveAddress();
    setWallet({ address, signatureType: 'arweave', name: wcnsState.names[address.toLocaleLowerCase()] || '' });
    setWalletModalOpen(false);
    // await checkWcns();
  }

  async function handleMetamask() {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      toast({
        title: 'Metamask not detected.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await contract.connect({
      signer: evmSignature,
      signatureType: 'ethereum',
    });

    setWallet({
      address: accounts[0],
      signatureType: 'ethereum',
      name: wcnsState.names[accounts[0].toLowerCase()] || '',
    });
    setWalletModalOpen(false);
    // await checkWcns();
  }

  function handleOpenWalletModal() {
    setWalletModalOpen(true);
  }

  // async function checkWcns() {
  //   const isNameAssigned = Object.keys(wcnsState.names).find((key) => key == wallet.address);
  //   if (isNameAssigned) {
  //   } else {
  //     setWcnsButton(true);
  //   }
  // }

  useEffect(() => {
    const isNameAssigned =
      wcnsState.names && Object.keys(wcnsState.names).find((key) => key == wallet.address.toLowerCase());
    if (!isNameAssigned) {
      setWcnsButton(true);
    }
  }, [wallet]);

  async function onSubmitRegistration(values: any) {
    console.log(values);
    if (wallet.signatureType == 'arweave') {
      await wcnsContract.connect('use_wallet');
    } else {
      await wcnsContract.connect({ signer: evmSignature, signatureType: 'ethereum' });
    }
    try {
      if (Object.keys(wcnsState.names).find((key) => wcnsState.names[key] == values.name)) {
        toast({
          title: 'Name already registered.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      await wcnsContract.writeInteraction({ function: 'registerName', name: values.name });
      setRegistrationNameModalOpen(false);
      setWallet({ ...wallet, name: values.name });
    } catch (e) {
      toast({
        title: 'Error during name registration.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setRegistrationNameModalOpen(false);
    }
    reset();
  }
  return (
    <Box p={5} height="100%">
      <Wallet
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        handleArweaveApp={handleArweaveApp}
        handleMetamask={handleMetamask}
      />
      <RegisterName
        isOpen={registrationNameModalOpen}
        onClose={() => setRegistrationNameModalOpen(false)}
        handleSubmit={handleSubmit(onSubmitRegistration)}
        register={register}
      />
      <Box mb={3} display="flex" justifyContent="space-between">
        <MainButton>Create new channel</MainButton>
        {wallet.address ? (
          <Box display="flex" alignItems="center">
            <Box color="blue">{wallet.name ? wallet.name : wallet.address}</Box>
            {wcnsButton && (
              <Box ml="2">
                <MainButton
                  size="xs"
                  handleClick={() => {
                    setRegistrationNameModalOpen(true);
                    setFocus('name');
                  }}
                >
                  {wallet.name ? 'Edit name' : 'Register name'}
                </MainButton>
              </Box>
            )}
          </Box>
        ) : (
          <MainButton handleClick={handleOpenWalletModal}>Connect wallet</MainButton>
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
            ref={parentRef}
            height="82%"
            px={10}
            mt={10}
            overflow="auto"
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
            {/* The large inner element to hold all of the items */}
            <Box
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {/* Only the visible items in the virtualizer, manually positioned to be in view */}
              {rowVirtualizer.getVirtualItems().map((virtualItem) => (
                <div
                  key={virtualItem.key}
                  data-index={virtualItem.index}
                  ref={rowVirtualizer.measureElement}
                  className={virtualItem.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <Box key={messages[virtualItem.index].id} bg="green" p={2} boxShadow="7px 5px black" mb={4}>
                    <Box color="black" fontSize="x-small" fontWeight="500">
                      {(wcnsState.names && wcnsState.names[messages[virtualItem.index].creator.toLowerCase()]) ||
                        messages[virtualItem.index].creator}
                    </Box>
                    {messages[virtualItem.index].content}
                  </Box>
                </div>
              ))}
            </Box>
          </Box>
          {/* <VirtualScroll
            rows={[<div />, <div />]}
            // rows={messages.map((m: any) => {
            //   return (
            //     // return walletAddress == m.creator ? (
            //     <Box key={m.id} bg="green" p={2} boxShadow="7px 5px black" mb={4}>
            //       <Box color="black" fontSize="x-small" fontWeight="500">
            //         {(wcnsState.names && wcnsState.names[m.creator.toLowerCase()]) || m.creator}
            //       </Box>
            //       {m.content}
            //     </Box>
            //   );
            // })}
          /> */}

          {/* <Box
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
                        {(wcnsState.names && wcnsState.names[m.creator.toLowerCase()]) || m.creator}
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
              <div ref={dummyScroll} />
            </Box>
          </Box> */}
          <Box position="absolute" bottom={0} width="100%" p={4}>
            <MainForm
              handleSubmit={handleSubmit(onSubmit)}
              register={register}
              placeholder={'Write your message'}
              id={'message'}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;
