import TransferModal from '@/components/TransferModal';
import { modalStackAtom } from '@/state/modal';
import { showSuccess } from '@/utils/notifications';
import { sendTransaction } from '@/utils/transaction';
import { config, helpers } from '@ckb-lumos/lumos';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  transferCluster as _transferCluster,
  predefinedSporeConfigs,
} from '@spore-sdk/core';
import { useMutation } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { Cluster } from 'spore-graphql';
import { useConnect } from '../useConnect';
import useSponsorClusterModal from './useSponsorClusterModal';

export default function useTransferClusterModal(cluster: Cluster | undefined) {
  const modalId = useId();
  const setModalStack = useSetAtom(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();

  // FIXME
  const capacityMargin = '0';
  // const { refetch } = trpc.cluster.list.useQuery(undefined, { enabled: false });

  // const { data: capacityMargin, refetch: refetchCapacityMargin } =
  //   trpc.cluster.getCapacityMargin.useQuery(
  //     { id: cluster?.id },
  //     { enabled: !!cluster && opened },
  //   );

  const sponsorClusterModal = useSponsorClusterModal(cluster);

  const transferCluster = useCallback(
    async (...args: Parameters<typeof _transferCluster>) => {
      const { txSkeleton } = await _transferCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const transferClusterMutation = useMutation({
    mutationFn: transferCluster,
    // FIXME
    // onSuccess: () => refetch(),
  });
  const loading =
    transferClusterMutation.isPending && !transferClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { to: string }) => {
      if (!address || !values.to || !cluster) {
        return;
      }
      await transferClusterMutation.mutateAsync({
        outPoint: cluster.cell?.outPoint!,
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
      // FIXME
      // refetchCapacityMargin();
      modals.open({
        modalId,
        title: `Transfer "${cluster!.name}"?`,
        onClose: close,
        closeOnEscape: !transferClusterMutation.isPending,
        withCloseButton: !transferClusterMutation.isPending,
        closeOnClickOutside: !transferClusterMutation.isPending,
        children: (
          <TransferModal
            type="cluster"
            capacityMargin={capacityMargin}
            onSubmit={handleSubmit}
            onSponsor={() => {
              close();
              setModalStack((stack) => [...stack, { open, close }]);
              sponsorClusterModal.open();
            }}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    cluster,
    transferClusterMutation.isPending,
    handleSubmit,
    opened,
    close,
    modalId,
    capacityMargin,
    // refetchCapacityMargin,
    open,
    setModalStack,
    sponsorClusterModal,
  ]);

  return {
    open,
    close,
    loading,
  };
}
