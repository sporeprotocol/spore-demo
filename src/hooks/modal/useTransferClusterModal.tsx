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
import { useConnect } from '../useConnect';
import useSponsorClusterModal from './useSponsorClusterModal';
import { QueryCluster } from '../query/type';
import { useClusterQuery } from '../query/useClusterQuery';
import { useClustersByAddressQuery } from '../query/useClustersByAddress';

export default function useTransferClusterModal(
  cluster: QueryCluster | undefined,
) {
  const modalId = useId();
  const setModalStack = useSetAtom(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const { data: { capacityMargin } = {} } = useClusterQuery(cluster?.id);
  const { refresh: refreShCluster } = useClusterQuery(cluster?.id);
  const { refresh: refreshClustersByAddress } =
    useClustersByAddressQuery(address);

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

  const onSuccess = useCallback(async () => {
    await Promise.all([refreShCluster(), refreshClustersByAddress()]);
  }, [refreShCluster, refreshClustersByAddress]);

  const transferClusterMutation = useMutation({
    mutationFn: transferCluster,
    onSuccess,
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
            capacityMargin={capacityMargin || undefined}
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
