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
      height="76%"
      px={10}
      mt={5}
      overflow="auto"
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
            <Box
              key={props.listEl[virtualItem.index].id}
              bg="lime"
              border="2px solid #240070;"
              padding="8px 20px 12px 20px"
              boxShadow="5px 5px 0px rgba(255, 156, 40, 0.35);"
              borderRadius="4px"
              mb={4}
              fontWeight="600"
              fontSize="16px"
              lineHeight="22.4px"
              color="buttonblue"
            >
              <Box
                fontWeight="400"
                fontSize="13px"
                lineHeight="19.5px"
                color="grey"
                display="flex"
                justifyContent="space-between"
              >
                <Box fontWeight="600">
                  {(props.stateEl.names &&
                    props.stateEl.names[props.listEl[virtualItem.index].creator.toLowerCase()]) ||
                    props.listEl[virtualItem.index].creator}
                </Box>{' '}
                <Box>{new Date(parseInt(props.listEl[virtualItem.index].timestamp)).toLocaleString()}</Box>
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
