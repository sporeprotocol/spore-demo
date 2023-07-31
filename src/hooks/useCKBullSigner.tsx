import { useQuery } from 'react-query';
import { useWalletStore } from './useWalletConnect';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { modals } from '@mantine/modals';
import { Box, Flex, LoadingOverlay } from '@mantine/core';
import QRCode from 'react-qr-code';
import { Transaction, helpers } from '@ckb-lumos/lumos';
import { useLocalStorage } from '@mantine/hooks';

const fetcher = (url: string, init?: RequestInit) =>
  fetch(url, init).then((res) => res.json());

interface ModalContentProps {
  opened: boolean;
  setOpened(opened: boolean): void;
}

function SignInModalContent(props: ModalContentProps) {
  const { opened, setOpened } = props;
  const { connected, update } = useWalletStore();
  const [_, setSignInToken] = useLocalStorage({
    key: 'spore.ckbull.signInToken',
  });

  const signInQuery = useQuery(
    ['ckbull-sign-in-request'],
    () => fetcher('/api/ckbull/sign-in', { method: 'POST' }),
    { enabled: opened },
  );
  const signInToken = useMemo(
    () => signInQuery.data?.signInToken,
    [signInQuery.data],
  );

  const pollingQuery = useQuery(
    ['ckbull-sign-in-polling', signInToken],
    () =>
      fetcher(
        `/api/ckbull/sign-in?signInToken=${encodeURIComponent(signInToken)}`,
      ),
    {
      refetchInterval: connected ? false : 1000,
      enabled: !!signInToken,
    },
  );

  useEffect(() => {
    if (pollingQuery.data) {
      const { status, metadata } = pollingQuery.data;
      if (status === 'signed') {
        update({
          connected: true,
          address: metadata.address,
          connectorType: 'ckbull',
        });
        setSignInToken(signInToken);
        setOpened(false);
      }
    }
  }, [pollingQuery.data, update, setOpened, setSignInToken, signInToken]);

  return (
    <Flex my="md" direction="row" justify="center">
      <Box w="256px" h="256px" pos="relative">
        <LoadingOverlay
          visible={signInQuery.isLoading || signInQuery.isRefetching}
          overlayBlur={2}
        />
        {signInToken && <QRCode value={signInToken} />}
      </Box>
    </Flex>
  );
}

function TransactionModalContent(
  props: ModalContentProps & {
    txSkeleton: helpers.TransactionSkeletonType;
    onSignedTransaction(tx: Transaction): void;
  },
) {
  const { opened, setOpened, txSkeleton, onSignedTransaction } = props;
  const [signInToken] = useLocalStorage({ key: 'spore.ckbull.signInToken' });

  const signTransactionQuery = useQuery(
    ['ckbull-transaction-request'],
    () =>
      fetcher('/api/ckbull/transaction', {
        method: 'POST',
        body: JSON.stringify({
          signInToken,
          transaction: helpers.transactionSkeletonToObject(txSkeleton),
        }),
      }),
    { enabled: !!signInToken },
  );
  const transactionToken = useMemo(
    () => signTransactionQuery.data?.transactionToken,
    [signTransactionQuery.data],
  );

  const pollingQuery = useQuery(
    ['ckbull-transaction-polling', transactionToken],
    () =>
      fetcher(
        `/api/ckbull/transaction?transactionToken=${encodeURIComponent(
          transactionToken,
        )}`,
      ),
    {
      refetchInterval: !opened ? false : 1000,
      enabled: !!transactionToken,
    },
  );

  useEffect(() => {
    if (pollingQuery.data) {
      const { status, transaction } = pollingQuery.data;
      if (status === 'signed') {
        onSignedTransaction(transaction);
        setOpened(false);
      }
    }
  }, [pollingQuery.data, setOpened, onSignedTransaction]);

  return (
    <Flex my="md" direction="row" justify="center">
      <Box w="256px" h="256px" pos="relative">
        <LoadingOverlay
          visible={
            signTransactionQuery.isLoading || signTransactionQuery.isRefetching
          }
          overlayBlur={2}
        />
        {transactionToken && <QRCode value={transactionToken} />}
      </Box>
    </Flex>
  );
}

export default function useCKBullSigner() {
  const [signInOpened, setSignInOpened] = useState(false);
  const [signTransactionOpened, setSignTransactionOpened] = useState(false);

  useEffect(() => {
    if (signInOpened) {
      modals.open({
        modalId: 'ckbull-sign-in',
        title: 'Sign In with CKBull',
        children: (
          <SignInModalContent
            opened={signInOpened}
            setOpened={setSignInOpened}
          />
        ),
      });
    } else {
      modals.close('ckbull-sign-in');
    }
  }, [signInOpened]);

  const connect = useCallback(() => {
    setSignInOpened(true);
  }, []);

  const signTransaction = useCallback(
    (txSkeleton: helpers.TransactionSkeletonType) => {
      setSignTransactionOpened(true);
      return new Promise<Transaction>((resolve) => {
        modals.open({
          modalId: 'ckbull-transaction',
          title: 'Sign Transaction with CKBull',
          children: (
            <TransactionModalContent
              opened={signTransactionOpened}
              setOpened={setSignTransactionOpened}
              txSkeleton={txSkeleton}
              onSignedTransaction={resolve}
            />
          ),
        });
      });
    },
    [signTransactionOpened],
  );

  return {
    connect,
    signTransaction,
  };
}
