import { useCallback } from 'react';
import { destroySpore as _destroySpore } from '@spore-sdk/core';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from 'react-query';
import { useConnect } from '../useConnect';

export default function useDestroySporeMutation() {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useConnect();

  const destroySpore = useCallback(
    async (...args: Parameters<typeof _destroySpore>) => {
      const { txSkeleton } = await _destroySpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const destroySporeMutation = useMutation(destroySpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
      queryClient.invalidateQueries(['account', address]);
    },
  });

  return destroySporeMutation;
}
