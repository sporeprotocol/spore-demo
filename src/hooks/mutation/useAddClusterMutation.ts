import { createCluster } from '@spore-sdk/core';
import { useCallback } from 'react';
import useWalletConnect from '../useWalletConnect';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from 'react-query';

export function useAddClusterMutation() {
  const queryClient = useQueryClient();
  const { signTransaction } = useWalletConnect();

  const addCluster = useCallback(
    async (...args: Parameters<typeof createCluster>) => {
      const { txSkeleton } = await createCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const addClusterMutation = useMutation(addCluster, {
    onSuccess: () => {
      queryClient.invalidateQueries('clusters');
    },
  });

  return addClusterMutation;
}
