import {
  predefinedSporeConfigs,
  transferCluster as _transferCluster,
} from '@spore-sdk/core';
import { BI } from '@ckb-lumos/lumos';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnect } from '../useConnect';
import { Cluster } from '@/cluster';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import { showSuccess } from '@/utils/notifications';
import { modalStackAtom } from '@/state/modal';
import { useAtomValue } from 'jotai';
import SponsorModal from '@/components/SponsorModal';
import { useMantineTheme } from '@mantine/core';

export default function useSponsorClusterModal(cluster: Cluster | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction, lock } = useConnect();
  const modalStack = useAtomValue(modalStackAtom);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { refetch } = trpc.cluster.list.useQuery(undefined, { enabled: false });

  const { data: capacityMargin } = trpc.cluster.getCapacityMargin.useQuery(
    { id: cluster?.id },
    { enabled: !!cluster },
  );

  const sponsorCluster = useCallback(
    async (...args: Parameters<typeof _transferCluster>) => {
      const { txSkeleton } = await _transferCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const sponsorClusterMutation = useMutation(sponsorCluster, {
    onSuccess: () => refetch(),
  });
  const loading =
    sponsorClusterMutation.isLoading && !sponsorClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { amount: number }) => {
      if (!address || !values.amount || !cluster) {
        return;
      }
      const { amount } = values;
      const newCapacity = BI.from(capacityMargin).add(
        BI.from(amount).mul(100_000_000),
      );
      await sponsorClusterMutation.mutateAsync({
        outPoint: cluster.cell.outPoint!,
        fromInfos: [address],
        toLock: lock!,
        config: predefinedSporeConfigs.Aggron4,
        capacityMargin: newCapacity.toHexString(),
        useCapacityMarginAsFee: false,
      });
      showSuccess('Cluster Transferred!');
      modals.close(modalId);
    },
    [address, cluster, sponsorClusterMutation, modalId, capacityMargin, lock],
  );

  useEffect(() => {
    if (opened) {
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
        closeOnEscape: !sponsorClusterMutation.isLoading,
        withCloseButton: !sponsorClusterMutation.isLoading,
        closeOnClickOutside: !sponsorClusterMutation.isLoading,
        children: (
          <SponsorModal
            type="cluster"
            data={cluster!}
            onSubmit={handleSubmit}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    cluster,
    sponsorClusterMutation.isLoading,
    handleSubmit,
    opened,
    close,
    modalId,
    modalStack,
    isMobile,
  ]);

  return {
    open,
    close,
    loading,
  };
}
