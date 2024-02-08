import CKBConnector from '@/connectors/base';
import { showError } from '@/utils/notifications';
import { Text, Alert, Button, Flex, createStyles } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export interface ConnectModalProps {
  connectors: CKBConnector[];
}

const useStyles = createStyles((theme) => ({
  button: {
    color: theme.colors.text[0],
    backgroundColor: theme.colors.background[0],
    border: `2px solid ${theme.colors.text[0]}`,
    paddingTop: '10px !important',
    paddingBottom: '10px !important',
    boxShadow: 'none !important',

    '&:hover': {
      color: theme.colors.background[0],
      backgroundColor: theme.colors.text[0],
    },
  },
  icon: {
    backgroundColor: 'transparent',

    '&.joyid': {
      borderRadius: '12px',
      border: `0.5px solid ${theme.colors.background[0]}`,
    },
  },
}));

export default function ConnectModal(props: ConnectModalProps) {
  const { connectors } = props;
  const { classes, cx } = useStyles();
  const [connectingConnector, setConnectingConnector] = useState('');

  const connect = async (connector: CKBConnector) => {
    try {
      setConnectingConnector(connector.type);
      await connector.connect();
      setConnectingConnector('');
    } catch (e) {
      showError((e as Error).message);
    }
  };

  return (
    <Flex direction="column" gap="md">
      <Alert variant="filled" color="brand.1" title="JoyID deprecated">
        We are deprecate the JoyID (Omnilock) option because it is more recommended to connect to
        JoyID using the JoyId lock instead of Omnilock.
        <Link
          href="https://github.com/sporeprotocol/spore-demo/issues/69"
          target="_blank"
          style={{
            textDecoration: 'none',
          }}
        >
          <Text color="brand.0">See spore-demo issue #69</Text>
        </Link>
      </Alert>
      {connectors.map((connector) => (
        <Button
          key={connector.type}
          className={classes.button}
          style={{
            cursor: connector.enabled ? 'pointer' : 'not-allowed',
          }}
          onClick={() => connect(connector)}
          loading={connectingConnector === connector.type}
          disabled={!connector.enabled}
        >
          <Flex align="center" gap="xs">
            <Image
              className={cx(classes.icon, connector.type.toLowerCase())}
              src={connector.icon}
              alt={connector.type}
              width="24"
              height="24"
            />
            {connector.type}
          </Flex>
        </Button>
      ))}
    </Flex>
  );
}
