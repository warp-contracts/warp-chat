import { Box } from '@chakra-ui/react';
import { FormControl, FormErrorMessage } from '@chakra-ui/react';
import { Input } from '@chakra-ui/react';
import MainButton from '../MainButton/MainButton';

function MainForm(props: { handleSubmit: any; register: any; placeholder: string; id: string; message?: boolean }) {
  return (
    <form onSubmit={props.handleSubmit}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <FormControl isRequired mr={5}>
          <Input
            bg="#FFFFFF;"
            borderRadius="4px"
            boxShadow={props.message ? '5px 5px 0px rgba(255, 156, 40, 0.35);' : '5px 5px 0px rgba(31, 0, 156, 0.25);'}
            color="#797979"
            border="2px solid #240070;"
            fontWeight="400"
            fontSize="16px"
            height="60px"
            lineHeight="140%"
            id={props.id}
            placeholder={props.placeholder}
            {...props.register(props.id)}
            _focus={{
              // bg: '#9AFFAA',
              // color: '#004E70',
              outline: 'none',
              // border: '2px solid #240070;',
              boxShadow: `${
                props.message ? '5px 5px 0px rgba(255, 156, 40, 0.35);' : '5px 5px 0px rgba(31, 0, 156, 0.25);'
              }`,
            }}
          />
          {/* <FormErrorMessage>{errors.name && errors.name.message}</FormErrorMessage> */}
        </FormControl>
        <MainButton type="submit">Send</MainButton>
      </Box>
    </form>
  );
}

export default MainForm;
