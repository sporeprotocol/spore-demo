import TransferModal from '@/components/TransferModal';
import { modalStackAtom } from '@/state/modal';
import { showSuccess } from '@/utils/notifications';
import { sendTransaction } from '@/utils/transaction';
import { BI, OutPoint, Script, config, helpers } from '@ckb-lumos/lumos';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { transferCluster as _transferCluster } from '@spore-sdk/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useConnect } from '../useConnect';
import useSponsorClusterModal from './useSponsorClusterModal';
import { QueryCluster } from '../query/type';
import { useClusterQuery } from '../query/useClusterQuery';
import { useClustersByAddressQuery } from '../query/useClustersByAddress';

export default function useTransferClusterModal(cluster: QueryCluster | undefined) {
  const modalId = useId();
  const setModalStack = useSetAtom(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const queryClient = useQueryClient();
  const { data: { capacityMargin } = {}, refresh: refreshCluster } = useClusterQuery(
    cluster?.id,
    opened,
  );
  const { refresh: refreshClustersByAddress } = useClustersByAddressQuery(address, false);

  const sponsorClusterModal = useSponsorClusterModal(cluster);

  const transferCluster = useCallback(
    async (...args: Parameters<typeof _transferCluster>) => {
      const { txSkeleton, outputIndex } = await _transferCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const txHash = await sendTransaction(signedTx);
      return {
        txHash,
        index: BI.from(outputIndex).toHexString(),
      } as OutPoint;
    },
    [signTransaction],
  );

  const onSuccess = useCallback(
    async (outPoint: OutPoint, variables: { toLock: Script }) => {
      await Promise.all([refreshCluster(), refreshClustersByAddress()]);
      queryClient.setQueryData(['cluster', cluster?.id], (data: { cluster: QueryCluster }) => {
        const cluster = {
          ...data.cluster,
          cell: {
            ...data.cluster.cell,
            cellOutput: {
              ...data.cluster.cell?.cellOutput,
              lock: variables.toLock,
            },
            outPoint,
          },
        };
        return { cluster };
      });
    },
    [cluster, queryClient, refreshCluster, refreshClustersByAddress],
  );

  const transferClusterMutation = useMutation({
    mutationFn: transferCluster,
    onSuccess,
  });
  const loading = transferClusterMutation.isPending && !transferClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: {
      to: string,
      useCapacityMarginAsFee: '1' | '0'
    }) => {
      if (!address || !values.to || !cluster) {
        return;
      }
      await transferClusterMutation.mutateAsync({
        outPoint: cluster.cell?.outPoint!,
        fromInfos: [address],
        toLock: helpers.parseAddress(values.to, {
          config: config.predefined.AGGRON4,
        }),
        useCapacityMarginAsFee: values.useCapacityMarginAsFee === '1',
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
