import './Chat.css';
import { Box, ModalBody, propNames } from '@chakra-ui/react';
import { Table, Tbody, Tr, Td, TableContainer } from '@chakra-ui/react';
import { useState, useEffect, useContext, useRef } from 'react';
import { subscribe, initPubSub } from 'warp-contracts-pubsub';
import { useForm } from 'react-hook-form';
import { ArweaveWebWallet } from 'arweave-wallet-connector';
import { WarpContext } from '../App';
import MainButton from '../components/MainButton/MainButton';
import { evmSignature } from 'warp-contracts-plugin-signature';
import MainForm from '../components/MainForm/MainForm';
import MetaMaskOnboarding from '@metamask/onboarding';
import MainModal from '../components/MainModal/MainModal';
import { useToast } from '@chakra-ui/react';
import MessagesList from '../components/MessagesList/MessagesList';
import ChannelsList from '../components/ChannelsList/ChannelsList';

initPubSub();

function Chat() {
  const { chatNsContractId, wcnsContract, chatContractSourceId, warp } = useContext(WarpContext);
  const [channels, setChannels] = useState(null);
  const [wallet, setWallet] = useState<any>({ address: '', signatureType: '', name: '' });
  const [messages, setMessages] = useState([]);
  const [walletModalOpen, setWalletModalOpen] = useState(true);
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [registrationNameModalOpen, setRegistrationNameModalOpen] = useState(false);
  const [wcnsButton, setWcnsButton] = useState(false);
  const [wcnsState, setWcnsState] = useState<{ names: any }>({ names: [] });
  const [currentContract, setCurrentContract] = useState({ id: '', contract: null });
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm();

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels() {
    const response = await fetch(
      `https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts-by-source?id=${chatContractSourceId}`
    ).then((res) => {
      return res.json();
    });
    const contractChannels = response.contracts.map((c) => c.contractId);
    setChannels(contractChannels);
    !currentContract.id &&
      setCurrentContract({ id: contractChannels[0], contract: warp.contract(contractChannels[0]) });
  }

  useEffect(() => {
    async function fetchContractState() {
      const response = await fetch(`https://dre-1.warp.cc/contract?id=${currentContract.id}`).then((res) => {
        return res.json();
      });
      setMessages(response.state.messages);
    }
    currentContract.id && fetchContractState();
  }, [currentContract.id]);

  useEffect(() => {
    fetchWcnsContractState();
  }, [wallet]);

  async function fetchWcnsContractState() {
    const response = await fetch(`https://dre-1.warp.cc/contract?id=${chatNsContractId}`).then((res) => {
      return res.json();
    });
    setWcnsState(response.state);
  }

  useEffect(() => {
    async function doSubscribe() {
      await subscribe(
        `states/${currentContract.id}`,
        ({ data }: any) => setMessages(JSON.parse(data).state.messages),
        console.error
      );
    }
    currentContract.id && doSubscribe();
  }, [currentContract.id]);

  useEffect(() => {
    const isNameAssigned =
      wcnsState.names && Object.keys(wcnsState.names).find((key) => key == wallet.address.toLowerCase());
    if (!isNameAssigned) {
      setWcnsButton(true);
    }
  }, [wallet]);

  async function onSubmit(values: any) {
    try {
      if (values.message.length > 280) {
        errorToast({
          title: 'Message too long.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      await currentContract.contract
        .connect(wallet.signatureType == 'arweave' ? 'use_wallet' : { signer: evmSignature, signatureType: 'ethereum' })
        .writeInteraction({ function: 'write', content: values.message });
      reset();
    } catch (e) {
      errorToast({
        title: 'Wallet not connected.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    }
  }

  async function handleArweaveApp() {
    const wallet = new ArweaveWebWallet();
    wallet.setUrl('arweave.app');
    await wallet.connect();
    currentContract.contract.connect('use_wallet');
    const address = wallet.namespaces.arweaveWallet.getActiveAddress();
    setWallet({ address, signatureType: 'arweave', name: wcnsState.names[address.toLocaleLowerCase()] || '' });
    setWalletModalOpen(false);
  }

  async function handleMetamask() {
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      errorToast({
        title: 'Metamask not detected.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    await currentContract.contract.connect({
      signer: evmSignature,
      signatureType: 'ethereum',
    });

    setWallet({
      address: accounts[0],
      signatureType: 'ethereum',
      name: wcnsState.names[accounts[0].toLowerCase()] || '',
    });
    setWalletModalOpen(false);
  }

  async function onSubmitRegistration(values: any) {
    if (wallet.signatureType == 'arweave') {
      await wcnsContract.connect('use_wallet');
    } else {
      await wcnsContract.connect({ signer: evmSignature, signatureType: 'ethereum' });
    }
    try {
      if (Object.keys(wcnsState.names).find((key) => wcnsState.names[key] == values.name)) {
        errorToast({
          title: 'Name already registered.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
      await wcnsContract.writeInteraction({ function: 'registerName', name: values.name, id: wallet.address });
      setRegistrationNameModalOpen(false);
      setWallet({ ...wallet, name: values.name });
    } catch (e) {
      errorToast({
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

  async function onSubmitChannelRegistration(values: any) {
    if (Object.keys(wcnsState.names).find((key) => wcnsState.names[key] == values.channelName)) {
      errorToast({
        title: 'Name already registered.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    const initialState = { messages: [] };
    try {
      const { contractTxId } = await warp.createContract.deployFromSourceTx({
        wallet: wallet.signatureType == 'arweave' ? 'use_wallet' : { signer: evmSignature, signatureType: 'ethereum' },
        initState: JSON.stringify(initialState),
        srcTxId: chatContractSourceId,
      });

      try {
        await wcnsContract
          .connect(
            wallet.signatureType == 'arweave' ? 'use_wallet' : { signer: evmSignature, signatureType: 'ethereum' }
          )
          .writeInteraction({ function: 'registerName', name: values.channelName, id: contractTxId });
        setChannelModalOpen(false);
        successToast({
          title: `Channel ${values.channelName} created.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
        await fetchWcnsContractState();
        await fetchChannels();
        setCurrentContract({ id: contractTxId, contract: warp.contract(contractTxId) });
      } catch (e) {
        errorToast({
          title: 'Wallet not connected.',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
        });
      }
    } catch (e) {
      errorToast({
        title: 'Error during channel creation.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      setChannelModalOpen(false);
    }
  }

  const errorToast = useToast({
    containerStyle: {
      border: '1px solid #E53E3E',
      backgroundColor: '#E53E3E',
      marginTop: '15px',
    },
  });

  const successToast = useToast({
    containerStyle: {
      border: '1px solid #00D100',
      backgroundColor: '#00D100',
      marginTop: '15px',
    },
  });

  return (
    <Box p={5} height="100%">
      <MainModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        header={'Choose wallet'}
        closeOnOverlay={false}
        closeButton={false}
      >
        <ModalBody display="flex" justifyContent="space-between">
          <MainButton handleClick={handleArweaveApp}>arweave.app</MainButton>
          <MainButton handleClick={handleMetamask}>Metamask</MainButton>
        </ModalBody>
      </MainModal>

      <MainModal
        isOpen={registrationNameModalOpen}
        onClose={() => setRegistrationNameModalOpen(false)}
        header={'Register name'}
        closeOnOverlay={true}
        closeButton={true}
      >
        <ModalBody>
          <MainForm
            handleSubmit={handleSubmit(onSubmitRegistration)}
            register={register}
            placeholder={'Write name'}
            id={'name'}
          />
        </ModalBody>
      </MainModal>
      <MainModal
        isOpen={channelModalOpen}
        onClose={() => setChannelModalOpen(false)}
        header={'Create channel'}
        closeOnOverlay={true}
        closeButton={true}
      >
        <ModalBody>
          <MainForm
            handleSubmit={handleSubmit(onSubmitChannelRegistration)}
            register={register}
            placeholder={'Write channel name'}
            id={'channelName'}
          />
        </ModalBody>
      </MainModal>
      <Box mb={3} display="flex" justifyContent="space-between">
        <MainButton handleClick={() => setChannelModalOpen(true)}>Create new channel</MainButton>
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
          <div />
        )}
      </Box>
      <Box display="flex" width="100%" height="90%">
        <Box width="25%" bg="orange" boxShadow="4px 4px black">
          {channels && (
            <ChannelsList
              listEl={channels}
              stateEl={wcnsState}
              setCurrentContract={setCurrentContract}
              currentContract={currentContract.id}
            />
          )}
        </Box>
        <Box width="75%" position="relative" bg="purple" ml={5} pr={5} boxShadow="4px 4px black">
          <MessagesList listEl={messages} stateEl={wcnsState} />
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
