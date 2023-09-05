import {
  predefinedSporeConfigs,
  transferCluster as _transferCluster,
} from '@spore-sdk/core';
import { config, helpers } from '@ckb-lumos/lumos';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnect } from '../useConnect';
import { Cluster } from '@/cluster';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import TransferModal from '@/components/TransferModal';
import { showSuccess } from '@/utils/notifications';

export default function useTransferClusterModal(cluster: Cluster | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();

  const { refetch } = trpc.cluster.list.useQuery(undefined, { enabled: false });

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
    onSuccess: () => refetch(),
  });
  const loading =
    transferClusterMutation.isLoading && !transferClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { to: string }) => {
      if (!address || !values.to || !cluster) {
        return;
      }
      await transferClusterMutation.mutateAsync({
        outPoint: cluster.cell.outPoint!,
        useCapacityMarginAsFee: false,
        fromInfos: [address],
        toLock: helpers.parseAddress(values.to, {
          config: config.predefined.AGGRON4,
        }),
        config: predefinedSporeConfigs.Aggron4,
      });
      showSuccess('Cluster Transferred!');
      modals.close(modalId);
    },
    [address, cluster, transferClusterMutation, modalId],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: `Transfer "${cluster!.name}"?`,
        onClose: close,
        closeOnEscape: !transferClusterMutation.isLoading,
        withCloseButton: !transferClusterMutation.isLoading,
        closeOnClickOutside: !transferClusterMutation.isLoading,
        children: <TransferModal type="cluster" onSubmit={handleSubmit} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [
    cluster,
    transferClusterMutation.isLoading,
    handleSubmit,
    opened,
    close,
    modalId,
  ]);

  return {
    open,
    close,
    loading,
  };
}
