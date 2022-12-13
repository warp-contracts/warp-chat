import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import MainButton from '../MainButton/MainButton';

function Wallet(props: { isOpen: boolean; onClose: any; handleArweaveApp: any; handleMetamask: any }) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Choose wallet</ModalHeader>
        <ModalCloseButton _focus={{ outline: 'none' }} />
        <ModalBody display="flex" justifyContent="space-between">
          <MainButton handleClick={props.handleArweaveApp}>arweave.app</MainButton>
          <MainButton handleClick={props.handleMetamask}>Metamask</MainButton>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default Wallet;
