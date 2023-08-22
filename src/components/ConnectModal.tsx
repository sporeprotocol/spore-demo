import CKBConnector from '@/connectors/base';
import { Button, Flex, createStyles } from '@mantine/core';
import { useState } from 'react';

export interface ConnectModalProps {
  connectors: CKBConnector[];
}

const useStyles = createStyles(() => ({
  button: {},
  metamask: {
    backgroundColor: 'orange',
    '&:hover': {
      backgroundColor: 'orange',
    },
  },
  joyid: {
    backgroundColor: 'green',
    '&:hover': {
      backgroundColor: 'green',
    },
  },
}));

export default function ConnectModal(props: ConnectModalProps) {
  const { connectors } = props;
  const { classes, cx } = useStyles();
  const [connectingConnector, setConnectingConnector] = useState('');

  const connect = async (connector: CKBConnector) => {
    setConnectingConnector(connector.type);
    await connector.connect();
    setConnectingConnector('');
  };

  return (
    <Flex direction="column" gap="md">
      {connectors.map((connector) => (
        <Button
          key={connector.type}
          className={cx(
            classes.button,
            classes[connector.type.toLowerCase() as keyof typeof classes],
          )}
          onClick={() => connect(connector)}
          loading={connectingConnector === connector.type}
          disabled={!connector.enable}
        >
          {connector.type} {connector.enable ? '' : '(Coming Soon)'}
        </Button>
      ))}
    </Flex>
  );
}
