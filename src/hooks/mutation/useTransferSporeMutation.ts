import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useMutation, useQueryClient } from 'react-query';
import useWalletConnect from '../useWalletConnect';
import { useCallback } from 'react';
import { sendTransaction } from '@/utils/transaction';

export default function useTransferSporeMutation() {
  const { address, signTransaction } = useWalletConnect();
  const queryClient = useQueryClient();

  const transferSpore = useCallback(
    async (...args: Parameters<typeof _transferSpore>) => {
      const { txSkeleton } = await _transferSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const transferSporeMutation = useMutation(transferSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
      queryClient.invalidateQueries(['account', address]);
    },
  });

  return transferSporeMutation;
}
