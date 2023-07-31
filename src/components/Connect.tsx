import { Button, Flex, Modal } from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import useCKBullSigner from '@/hooks/useCKBullSigner';
import useWalletConnect from '@/hooks/useWalletConnect';
import { useEffect, useMemo } from 'react';
import useMetaMask from '@/hooks/useMetaMask';

export default function Connect() {
  const clipboard = useClipboard({ timeout: 500 });
  const [opened, { open, close }] = useDisclosure(false);
  const { address, connected } = useWalletConnect();
  const ckbullSigner = useCKBullSigner();
  const metaMask = useMetaMask();

  const displayAddress = useMemo(() => {
    return connected ? `${address?.slice(0, 8)}...${address?.slice(-8)}` : '';
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
            onClick={ckbullSigner.connect}
            fullWidth
          >
            CKBull
          </Button>
        </Flex>
      </Modal>

      {connected ? (
        <Button
          w={200}
          variant="outline"
          onClick={() => clipboard.copy(address)}
        >
          {displayAddress}
        </Button>
      ) : (
        <Button onClick={open}>Connect</Button>
      )}
    </>
  );
}
