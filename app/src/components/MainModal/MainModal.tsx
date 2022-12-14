import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

function MainModal(props: {
  isOpen: boolean;
  onClose: any;
  header: string;
  children: any;
  closeOnOverlay: boolean;
  closeButton: boolean;
}) {
  return (
    <Modal closeOnOverlayClick={props.closeOnOverlay} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{props.header}</ModalHeader>
        {props.closeButton && <ModalCloseButton _focus={{ outline: 'none' }} />}
        <ModalBody>{props.children}</ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default MainModal;
