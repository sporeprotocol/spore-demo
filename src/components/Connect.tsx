import { Text, Button } from '@mantine/core';
import useWalletConnect from '@/hooks/useWalletConnect';
import { useRouter } from 'next/router';
import { BI } from '@ckb-lumos/lumos';
import useAccountQuery from '@/hooks/query/useAccountQuery';
import { useMemo } from 'react';

export default function Connect() {
  const { address, connected, connect } = useWalletConnect();
  const router = useRouter();

  const accountQuery = useAccountQuery();
  const balance = useMemo(() => {
    const capacities = BI.from(accountQuery.data?.capacities ?? 0).toNumber();
    return Math.floor(capacities / 10 ** 8);
  }, [accountQuery.data?.capacities]);

  const displayAddress = useMemo(() => {
    return connected ? `${address?.slice(0, 5)}...${address?.slice(-5)}` : '';
  }, [address, connected]);

  return (
    <>
      {connected ? (
        <Button.Group>
          <Button variant="light" color="gray">
            <Text color="black">{balance} CKB</Text>
          </Button>
          <Button variant="light" onClick={() => router.push(`/account/${address}`)}>
            {displayAddress}
          </Button>
        </Button.Group>
      ) : (
        <Button onClick={connect}>Connect</Button>
      )}
    </>
  );
}
