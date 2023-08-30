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

interface CustonMessageProps {
  icon: string;
  message: string;
  onClick?: () => Promise<void> | void;
}

const CustonMessage = (props: CustonMessageProps) => {
  const { icon, message, onClick } = props;
  return (
    <Flex justify="space-between">
      <Flex align="center">
        <Box mr="8px">
          <Image src={icon} width="24" height="24" alt="notification" />
        </Box>
        <Text size="lg" weight="700">
          {message}
        </Text>
      </Flex>
      <Flex align="center" sx={{ cursor: 'pointer' }} onClick={onClick}>
        {!!onClick && (
          <Text weight="600" color="brand.1">
            View Details
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export function showSuccess(message: string, onClick?: () => void) {
  notifications.show({
    color: 'brand.0',
    message: (
      <CustonMessage
        icon="/svg/icon-check-circle.svg"
        message={message}
        onClick={onClick}
      />
    ),
    withCloseButton: false,
    styles: styles,
  });
}

export function showError(message: string, onClick?: () => void) {
  notifications.show({
    color: 'brand.0',
    message: (
      <CustonMessage
        icon="/svg/icon-x-circle.svg"
        message={message}
        onClick={onClick}
      />
    ),
    withCloseButton: false,
    styles: styles,
  });
}
