import { predefinedSporeConfigs, transferCluster as _transferCluster } from '@spore-sdk/core';
import { BI, OutPoint } from '@ckb-lumos/lumos';
import { useCallback, useEffect, useRef } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnect } from '../useConnect';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import { modalStackAtom } from '@/state/modal';
import { useAtomValue } from 'jotai';
import SponsorModal from '@/components/SponsorModal';
import { useMantineTheme } from '@mantine/core';
import { QueryCluster } from '../query/type';
import { useClusterQuery } from '../query/useClusterQuery';
import { cloneDeep, update } from 'lodash-es';

export default function useSponsorClusterModal(cluster: QueryCluster | undefined) {
  const modalId = useId();
  const modalStack = useAtomValue(modalStackAtom);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction, lock } = useConnect();
  const queryClient = useQueryClient();
  const { data: { capacityMargin } = {}, refresh: refreshCluster } = useClusterQuery(
    opened ? cluster?.id : undefined,
  );
  const nextCapacityMarginRef = useRef<string | undefined>();

  const sponsorCluster = useCallback(
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
    async (outPoint: OutPoint) => {
      if (!cluster) return;
      await refreshCluster();
      const capacityMargin = nextCapacityMarginRef.current;
      const capacity = BI.from(cluster?.cell?.cellOutput.capacity ?? 0)
        .add(BI.from(capacityMargin).sub(cluster?.capacityMargin ?? 0))
        .toHexString();

      queryClient.setQueryData(['cluster', cluster.id], (data: { cluster: QueryCluster }) => {
        const { cluster } = data;
        const newCluster = cloneDeep(cluster);
        update(newCluster, 'capacityMargin', () => capacityMargin);
        update(newCluster, 'cell.cellOutput.capacity', () => capacity);
        update(newCluster, 'cell.outPoint', () => outPoint);
        return { cluster: newCluster };
      });
    },
    [cluster, queryClient, refreshCluster],
  );

  const sponsorClusterMutation = useMutation({
    mutationFn: sponsorCluster,
    onSuccess,
  });
  const loading = sponsorClusterMutation.isPending && !sponsorClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { amount: number }) => {
      if (!address || !values.amount || !cluster) {
        return;
      }
      const { amount } = values;
      const nextCapacityMargin = BI.from(capacityMargin).add(BI.from(amount).mul(100_000_000));
      nextCapacityMarginRef.current = nextCapacityMargin.toHexString();

      await sponsorClusterMutation.mutateAsync({
        outPoint: cluster.cell?.outPoint!,
        fromInfos: [address],
        toLock: lock!,
        config: predefinedSporeConfigs.Aggron4,
        capacityMargin: nextCapacityMargin.toHexString(),
        useCapacityMarginAsFee: false,
      });
      showSuccess(`${amount.toLocaleString('en-US')} CKByte sponsored to Cluster!`);
      modals.close(modalId);
    },
    [address, cluster, sponsorClusterMutation, modalId, capacityMargin, lock],
  );

  useEffect(() => {
    if (opened) {
      refreshCluster();
      modals.open({
        modalId,
        title: `Sponsor Cluster`,
        onClose: () => {
          close();
          const nextModal = modalStack.pop();
          if (nextModal) {
            nextModal.open();
          }
        },
        styles: {
          content: {
            minWidth: isMobile ? 'auto' : '560px',
          },
        },
        closeOnEscape: !sponsorClusterMutation.isPending,
        withCloseButton: !sponsorClusterMutation.isPending,
        closeOnClickOutside: !sponsorClusterMutation.isPending,
        children: <SponsorModal type="cluster" data={cluster!} onSubmit={handleSubmit} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [
    cluster,
    sponsorClusterMutation.isPending,
    handleSubmit,
    opened,
    close,
    modalId,
    modalStack,
    isMobile,
    refreshCluster,
  ]);

  return {
    open,
    close,
    loading,
  };
}
