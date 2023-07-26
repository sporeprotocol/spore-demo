import useCkbAddress from '@/hooks/useCkbAddress';
import { Button } from '@mantine/core';
import { useMemo } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function ConnectButton() {
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { address: ethAddress, isConnected } = useAccount();
  const { address } = useCkbAddress(ethAddress);

  const displayAddress = useMemo(() => {
    return isConnected
      ? `${address?.slice(0, 10)}...${address?.slice(-10)}`
      : '';
  }, [address, isConnected]);

  return (
    <div>
      {isConnected ? (
        <Button variant="outline">{displayAddress}</Button>
      ) : (
        <Button onClick={() => connect()}>Connect</Button>
      )}
    </div>
  );
}
