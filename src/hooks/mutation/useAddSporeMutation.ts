import { Cluster } from '@/utils/cluster';
import { getScript } from '@/utils/script';
import { createSpore } from '@spore-sdk/core';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { sendTransaction } from '@/utils/transaction';
import { useConnect } from '../useConnect';

export default function useAddSporeMutation(cluster: Cluster | undefined) {
  const queryClient = useQueryClient();
  const { address, signTransaction } = useConnect();

  const addSpore = useCallback(
    async (...args: Parameters<typeof createSpore>) => {
      let { txSkeleton, cluster: sporeCluster } = await createSpore(...args);
      const anyoneCanPayScript = getScript('ANYONE_CAN_PAY');
      if (
        cluster &&
        cluster.cell.cellOutput.lock.codeHash === anyoneCanPayScript.CODE_HASH
      ) {
        txSkeleton = txSkeleton.update('witnesses', (witnesses) => {
          return witnesses.set(sporeCluster!.inputIndex, '0x');
        });
      }
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction, cluster],
  );

  const addSporeMutation = useMutation(addSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
      queryClient.invalidateQueries(['account', address]);
    },
  });

  return addSporeMutation;
}
