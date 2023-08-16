import { Text, Button } from '@mantine/core';
import { useRouter } from 'next/router';
import { BI } from '@ckb-lumos/lumos';
import { useMemo } from 'react';
import { useConnect } from '@/hooks/useConnect';
import { trpc } from '@/server';

export default function Connect() {
  const { address, connected, connect } = useConnect();
  const router = useRouter();
  const { data: capacities = '0x0' } = trpc.accout.balance.useQuery({
    address,
  });

  const balance = useMemo(() => {
    const shannon = BI.from(capacities).toNumber();
    return Math.floor(shannon / 10 ** 8);
  }, [capacities]);

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
          <Button
            variant="light"
            onClick={() => router.push(`/${address}`)}
          >
            {displayAddress}
          </Button>
        </Button.Group>
      ) : (
        <Button onClick={connect}>Connect</Button>
      )}
    </>
  );
}
