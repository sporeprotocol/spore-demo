import { Text, Flex, Box } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import Image from 'next/image';

const styles: Parameters<(typeof notifications)['show']>[0]['styles'] = (
  theme,
) => ({
  root: {
    backgroundColor: theme.colors.brand[0],
    borderRadius: '8px',
    boxShadow: '4px 4px 0 #111318',
    padding: '16px',
    width: '375px',
    maxWidth: '70vw',
  },
});

export function showNotifaction(message: string, onClick?: () => void) {
  notifications.show({
    color: 'brand.0',
    message: (
      <Flex justify="space-between">
        <Flex align="center">
          <Box mr="8px">
            <Image
              src="/svg/icon-check-circle.svg"
              width="24"
              height="24"
              alt="notification"
            />
          </Box>
          <Text size="lg" weight="700">
            {message}
          </Text>
        </Flex>
        <Flex align="center" sx={{ cursor: 'pointer' }} onClick={onClick}>
          {onClick && (
            <Text weight="600" color="brand.1">
              View Details
            </Text>
          )}
        </Flex>
      </Flex>
    ),
    withCloseButton: false,
    styles: styles,
  });
}
