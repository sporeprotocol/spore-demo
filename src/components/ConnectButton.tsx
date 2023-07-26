import useCkbAddress from '@/hooks/useCkbAddress';
import { Button, Tooltip } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function ConnectButton() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { address: ethAddress, isConnected } = useAccount();
  const { address } = useCkbAddress(ethAddress);
  const clipboard = useClipboard({ timeout: 500 });

  const displayAddress = useMemo(() => {
    return isConnected
      ? `${address?.slice(0, 8)}...${address?.slice(-8)}`
      : '';
  }, [address, isConnected]);

  return (
    <div>
      {isConnected ? (
        <Button w={200} variant="outline" onClick={() => clipboard.copy(address)}>
          {displayAddress}
        </Button>
      ) : (
        <Button onClick={() => connect()}>Connect</Button>
      )}
    </div>
  );
}
