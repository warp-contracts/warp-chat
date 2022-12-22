import { Box } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useContext, useEffect, useRef } from 'react';
import { Divider } from '@chakra-ui/react';
import { WarpContext } from '../../App';
import MainButton from '../MainButton/MainButton';
import { Image } from '@chakra-ui/react';
import plus from '../../assets/plus.svg';

function ChannelsList(props: {
  listEl: any;
  stateEl: any;
  setCurrentContract: any;
  currentContract: string;
  reset: any;
  setChannelModalOpen: any;
}) {
  const { warp } = useContext(WarpContext);
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: props.listEl.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <Box height="100%">
      <Box display="flex" justifyContent="center" paddingBottom="30px">
        <MainButton handleClick={() => props.setChannelModalOpen(true)}>
          <Image
            src={plus}
            height="14px"
            width="14px"
            marginRight="5px"
            filter="invert(19%) sepia(97%) saturate(1275%) hue-rotate(171deg) brightness(92%) contrast(104%);"
          />
          Create new channel
        </MainButton>
      </Box>
      <Box
        ref={parentRef}
        style={{
          height: `87%`,
          overflow: 'auto',
        }}
        css={{
          '&::-webkit-scrollbar': {
            width: '10px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#240070',
            borderRadius: '4px',
          },
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className={virtualItem.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {props.listEl && (
                <>
                  <Box
                    key={props.listEl[virtualItem.index]}
                    onClick={() => {
                      props.setCurrentContract({
                        id: props.listEl[virtualItem.index],
                        contract: warp.contract(props.listEl[virtualItem.index]),
                      });
                      props.reset();
                    }}
                    cursor="pointer"
                    padding="9px 16px 9px 16px"
                    color="#604297"
                    lineHeight="27px"
                    fontSize="16px"
                    fontWeight="500"
                    border={
                      props.listEl[virtualItem.index] == props.currentContract
                        ? '2px solid #240070;'
                        : '2px solid #604297;'
                    }
                    borderRadius="4px"
                    marginBottom="17px"
                    marginRight="10px"
                    boxShadow={
                      props.listEl[virtualItem.index] == props.currentContract
                        ? '5px 5px 0px rgba(31, 0, 156, 0.25);'
                        : ''
                    }
                    bg={
                      props.listEl[virtualItem.index] == props.currentContract ? 'verylightpinkgrad' : 'verylightpink'
                    }
                    _hover={{ background: props.listEl[virtualItem.index] == props.currentContract ? '' : '#FBEEFF' }}
                  >
                    <Box>
                      {props.stateEl.names[props.listEl[virtualItem.index].toLowerCase()] ||
                        props.listEl[virtualItem.index]}
                    </Box>
                  </Box>
                  <Divider />
                </>
              )}
            </div>
          ))}
        </div>
      </Box>
    </Box>
  );
}

export default ChannelsList;
