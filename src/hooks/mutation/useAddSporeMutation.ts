import { createSpore } from '@spore-sdk/core';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { sendTransaction } from '@/utils/transaction';
import { useConnect } from '../useConnect';
import { Cluster } from '@/cluster';

export default function useAddSporeMutation(_: Cluster | undefined) {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useConnect();

  const addSpore = useCallback(
    async (...args: Parameters<typeof createSpore>) => {
      let { txSkeleton, cluster } = await createSpore(...args);
      console.log(cluster);
      const signedTx = await signTransaction(txSkeleton);
      console.log(signedTx);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const addSporeMutation = useMutation(addSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
      queryClient.invalidateQueries(['account', address]);
    },
  });

  return addSporeMutation;
}
