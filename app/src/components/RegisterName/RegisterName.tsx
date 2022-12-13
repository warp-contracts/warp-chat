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
import { Box } from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';
import MainForm from '../Input/MainForm';
import { useRef } from 'react';

function RegisterName(props: { isOpen: boolean; onClose: any; handleSubmit: any; register: any }) {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Register name</ModalHeader>
        <ModalCloseButton _focus={{ outline: 'none' }} />
        <ModalBody>
          <MainForm
            handleSubmit={props.handleSubmit}
            register={props.register}
            placeholder={'Write name'}
            id={'name'}
          />
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default RegisterName;
