import { Button } from '@chakra-ui/react';

function MainButton(props: {
  size?: string;
  handleClick?: any;
  children: any;
  type?: 'button' | 'submit' | 'reset';
  withIcon?: boolean;
}) {
  return (
    <Button
      bg="green"
      color="buttonblue"
      fontSize="18px"
      fontWeight="700"
      lineHeight="27px"
      border="2px solid #240070;"
      size={props.size || 'lg'}
      _hover={{ bg: '#9AFFAA', color: '#004E70', outline: 'none', border: '2px solid #240070;' }}
      _focus={{ outline: 'none' }}
      borderRadius="4px"
      boxShadow="5px 5px 0px #240070;"
      padding="7px 20px 8px;"
      onClick={() => props.handleClick && props.handleClick()}
      type={props.type}
    >
      {props.children}
    </Button>
  );
}

export default MainButton;
