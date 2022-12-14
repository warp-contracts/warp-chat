import { Box } from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import MainButton from '../MainButton/MainButton';

function MainForm(props: { handleSubmit: any; register: any; placeholder: string; id: string }) {
  return (
    <form onSubmit={props.handleSubmit}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormControl isRequired mr={5}>
          <Input
            bg="white"
            borderRadius="none"
            color="black"
            id={props.id}
            placeholder={props.placeholder}
            {...props.register(props.id)}
          />
          {/* <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage> */}
        </FormControl>
        <MainButton size="md" type="submit">
          Send
        </MainButton>
      </Box>
    </form>
  );
}

export default MainForm;
