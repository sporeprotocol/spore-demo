import { createCluster } from '@spore-sdk/core';
import { useCallback } from 'react';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from 'react-query';
import { useConnect } from '../useConnect';

export default function useCreateClusterMutation() {
  const queryClient = useQueryClient();
  const { signTransaction } = useConnect();

  const addCluster = useCallback(
    async (...args: Parameters<typeof createCluster>) => {
      const { txSkeleton } = await createCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
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
