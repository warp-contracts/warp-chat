import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useRef } from 'react';

function MainModal(props: {
  isOpen: boolean;
  onClose: any;
  header: string;
  children: any;
  closeOnOverlay: boolean;
  closeButton: boolean;
}) {
  const initialRef = useRef(null);

  return (
    <Modal trapFocus={false} closeOnOverlayClick={props.closeOnOverlay} isOpen={props.isOpen} onClose={props.onClose}>
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
