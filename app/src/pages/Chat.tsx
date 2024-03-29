import './Chat.css';
import { Box, ModalBody, Button } from '@chakra-ui/react';
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
import { Image } from '@chakra-ui/react';
import warpLogo from '../assets/warp-logo.svg';

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
  const [subscription, setSubscription] = useState(null);
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
    setFocus,
  } = useForm();
  const channelListRef = useRef(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  async function fetchChannels(id?: string) {
    const response = await fetch(
      `https://d1o5nlqr4okus2.cloudfront.net/gateway/contracts-by-source?id=${chatContractSourceId}`
    ).then((res) => {
      return res.json();
    });
    const contractChannels = response.contracts.map((c) => c.contractId);
    setChannels(contractChannels);
    !currentContract.id &&
      setCurrentContract({ id: id || contractChannels[0], contract: warp.contract(id || contractChannels[0]) });
    channelListRef.current && channelListRef.current.scrollTo(contractChannels.indexOf(id));
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

  async function unsubscribe(sub: any) {
    await sub.unsubscribe();
  }
  useEffect(() => {
    async function doSubscribe() {
      const subscription = await subscribe(
        `states/${currentContract.id}`,
        ({ data }: any) => setMessages(JSON.parse(data).state.messages),
        console.error
      );

      setSubscription(subscription);
    }
    if (subscription) {
      unsubscribe(subscription);
    }
    doSubscribe();
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
    const initialState = { messages: [], owner: 'jnioZFibZSCcV8o-HkBXYPYEYNib4tqfexP0kCBXX_M', evolve: '' };
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
        await fetchChannels(contractTxId);
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
      <Box mb={3} display="flex" justifyContent="space-between" height="72px">
        <Box>
          <Image src={warpLogo} height="60px" />
        </Box>
        {wallet.address ? (
          <Box display="flex" alignItems="center">
            <Box color="buttonblue">{wallet.name ? wallet.name : wallet.address}</Box>
            {wcnsButton && (
              <Box ml="2">
                <MainButton
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
      <Box display="flex" width="100%" height="85%">
        <Box
          width="25%"
          bg="lightpinkgrad"
          boxShadow="5px 5px 0px rgba(31, 0, 156, 0.25);"
          border=" 2px solid #240070;"
          borderRadius="4px"
          padding="37px 16px 37px 16px"
        >
          {channels && (
            <ChannelsList
              listEl={channels}
              stateEl={wcnsState}
              setCurrentContract={setCurrentContract}
              currentContract={currentContract.id}
              reset={reset}
              setChannelModalOpen={setChannelModalOpen}
              ref={channelListRef}
            />
          )}
        </Box>
        <Box
          width="75%"
          position="relative"
          bg="yellowgrad"
          border="2px solid #240070;"
          ml={5}
          pr={5}
          boxShadow="5px 5px 0px rgba(31, 0, 156, 0.25);"
          borderRadius="4px"
        >
          <Box px={10} pt={5} color="buttonblue">
            View contract in SonAR:{' '}
            <a
              href={`https://sonar.warp.cc/#/app/contract/${currentContract.id}`}
              target="_blank"
              style={{ color: '' }}
            >
              {currentContract.id}
            </a>
          </Box>
          <MessagesList listEl={messages} stateEl={wcnsState} />
          <Box position="absolute" bottom={0} width="100%" paddingLeft="40px" paddingRight="70px" paddingBottom="20px">
            <MainForm
              handleSubmit={handleSubmit(onSubmit)}
              register={register}
              placeholder={'Write your message'}
              id={'message'}
              message={true}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Chat;
