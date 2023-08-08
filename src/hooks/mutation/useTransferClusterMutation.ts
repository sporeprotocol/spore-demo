import { useCallback } from 'react';
import { transferCluster as _transferCluster } from '@spore-sdk/core';
import useWalletConnect from '../useWalletConnect';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from 'react-query';
import { Cluster } from '@/utils/cluster';

export default function useTransferClusterMutation(
  cluster: Cluster | undefined,
) {
  const { signTransaction } = useWalletConnect();
  const queryClient = useQueryClient();

  const transferCluster = useCallback(
    async (...args: Parameters<typeof _transferCluster>) => {
      const { txSkeleton } = await _transferCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const transferClusterMutation = useMutation(transferCluster, {
    onSuccess: () => {
      queryClient.invalidateQueries('clusters');
      queryClient.invalidateQueries(['cluster', cluster?.id]);
    },
  });

  return transferClusterMutation;
}
