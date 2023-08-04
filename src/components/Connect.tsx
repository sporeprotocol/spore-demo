import { Text, Button, Flex, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
// import useCKBullSigner from '@/hooks/useCKBullSigner';
import useWalletConnect from '@/hooks/useWalletConnect';
import { useEffect, useMemo } from 'react';
import useMetaMask from '@/hooks/useMetaMask';
import { useRouter } from 'next/router';
import useAccountQuery from '@/hooks/useAccountQuery';
import { BI } from '@ckb-lumos/lumos';

export default function Connect() {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, connected } = useWalletConnect();
  const router = useRouter();

  // const ckbullSigner = useCKBullSigner();
  const metaMask = useMetaMask();

  const accountQuery = useAccountQuery();
  const balance = useMemo(() => {
    const capacities = BI.from(accountQuery.data?.capacities ?? 0).toNumber();
    return Math.floor(capacities / 10 ** 8);
  }, [accountQuery.data?.capacities]);

  const displayAddress = useMemo(() => {
    return connected ? `${address?.slice(0, 5)}...${address?.slice(-5)}` : '';
  }, [address, connected]);

  useEffect(() => {
    if (connected) {
      close();
    }
  }, [close, connected]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Connect Wallet">
        <Flex direction="column" gap={10}>
          <Button
            variant="light"
            color="orange"
            radius="md"
            onClick={metaMask.connect}
            fullWidth
          >
            MetaMask
          </Button>
          <Button
            variant="light"
            color="green"
            radius="md"
            disabled
            fullWidth
          >
            CKBull
          </Button>
        </Flex>
      </Modal>

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
        <Button onClick={open}>Connect</Button>
      )}
    </>
  );
}
