import { Box } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useContext, useEffect, useRef } from 'react';
import { Divider } from '@chakra-ui/react';
import { WarpContext } from '../../App';

function ChannelsList(props: { listEl: any; stateEl: any; setCurrentContract: any; currentContract: string }) {
  const { warp } = useContext(WarpContext);
  const parentRef = useRef();

  const virtualizer = useVirtualizer({
    count: props.listEl.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  useEffect(() => {
    virtualizer.scrollToIndex(props.listEl.length);
  }, [props.listEl]);
  return (
    <Box
      ref={parentRef}
      overflow="auto"
      css={{
        '&::-webkit-scrollbar': {
          width: '10px',
        },
        '&::-webkit-scrollbar-track': {
          width: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'white',
          borderRadius: 'none',
        },
      }}
    >
      <Box
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
                  onClick={() =>
                    props.setCurrentContract({
                      id: props.listEl[virtualItem.index],
                      contract: warp.contract(props.listEl[virtualItem.index]),
                    })
                  }
                  cursor="pointer"
                  p={4}
                  bg={props.listEl[virtualItem.index] == props.currentContract ? 'lightpink' : ''}
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
      </Box>
    </Box>
  );
}

export default ChannelsList;
