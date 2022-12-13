import { Button } from '@chakra-ui/react';

function MainButton(props: {
  size?: string;
  handleClick?: any;
  children: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  return (
    <Button
      bg="blue"
      color="white"
      size={props.size || 'lg'}
      _hover={{ bg: 'blue', borderColor: 'transparent' }}
      _focus={{ outline: 'none' }}
      borderRadius="none"
      boxShadow="7px 5px black"
      onClick={() => props.handleClick && props.handleClick()}
      type={props.type}
    >
      {props.children}
    </Button>
  );
}

export default MainButton;
