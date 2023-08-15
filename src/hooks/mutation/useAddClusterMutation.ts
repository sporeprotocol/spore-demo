import { createCluster } from '@spore-sdk/core';
import { useCallback } from 'react';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from 'react-query';
import { useConnect } from '../useConnect';
import { helpers } from '@ckb-lumos/lumos';

export function useAddClusterMutation() {
  const queryClient = useQueryClient();
  const { signTransaction } = useConnect();

  const addCluster = useCallback(
    async (...args: Parameters<typeof createCluster>) => {
      console.log(args);
      const { txSkeleton } = await createCluster(...args);
      console.log(helpers.createTransactionFromSkeleton(txSkeleton));
      const signedTx = await signTransaction(txSkeleton);
      console.log(signedTx);
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
