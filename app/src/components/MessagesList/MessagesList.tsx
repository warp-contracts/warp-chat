import { Box } from '@chakra-ui/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

function MessagesList(props: { listEl: any; stateEl: any }) {
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
      height="82%"
      px={10}
      mt={10}
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
            <Box key={props.listEl[virtualItem.index].id} bg="green" p={2} boxShadow="7px 5px black" mb={4}>
              <Box color="black" fontSize="x-small" fontWeight="500">
                {(props.stateEl.names && props.stateEl.names[props.listEl[virtualItem.index].creator.toLowerCase()]) ||
                  props.listEl[virtualItem.index].creator}
              </Box>
              {props.listEl[virtualItem.index].content}
            </Box>
          </div>
        ))}
      </Box>
    </Box>
  );
}

export default MessagesList;
