import useConnect from '@/hooks/useConnect';
import { Button } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { useEffect, useMemo } from 'react';

export default function ConnectButton() {
  const { address, connect, isConnected } = useConnect();
  const clipboard = useClipboard({ timeout: 500 });
  const displayAddress = useMemo(() => {
    return isConnected ? `${address?.slice(0, 8)}...${address?.slice(-8)}` : '';
  }, [address, isConnected]);

  useEffect(() => {
    const connected = localStorage.getItem('wagmi.connected');
    if (connected && !isConnected) {
      connect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      {isConnected ? (
        <Button
          w={200}
          variant="outline"
          onClick={() => clipboard.copy(address)}
        >
          {displayAddress}
        </Button>
      ) : (
        <Button onClick={() => connect()}>Connect</Button>
      )}
    </div>
  );
}
