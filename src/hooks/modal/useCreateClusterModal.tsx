import { useCallback, useEffect } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnect } from '../useConnect';
import CreateClusterModal from '@/components/CreateClusterModal';
import { createCluster } from '@spore-sdk/core';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import { useRouter } from 'next/router';
import { useMantineTheme } from '@mantine/core';
import { BI } from '@ckb-lumos/lumos';
import { useClustersByAddressQuery } from '../query/useClustersByAddress';

export default function useCreateClusterModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { address, lock, getAnyoneCanPayLock, signTransaction } = useConnect();
  const { refresh: refreshClustersByAddress } = useClustersByAddressQuery(address, false);
  const modalId = useId();

  const addCluster = useCallback(
    async (...args: Parameters<typeof createCluster>) => {
      const { txSkeleton, outputIndex } = await createCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      await sendTransaction(signedTx);
      const outputs = txSkeleton.get('outputs');
      const cluster = outputs.get(outputIndex);
      return cluster;
    },
    [signTransaction],
  );

  const onSuccess = useCallback(async () => {
    await refreshClustersByAddress();
  }, [refreshClustersByAddress]);

  const addClusterMutation = useMutation({ mutationFn: addCluster, onSuccess });
  const loading = addClusterMutation.isPending && !addClusterMutation.isError;

  const handleSubmit = useCallback(
    async (
      values: { name: string; description: string; public: string },
      useCapacityMargin?: boolean,
    ) => {
      if (!address || !lock) {
        return;
      }

      const toLock = values.public === '1' ? getAnyoneCanPayLock() : lock;
      const cluster = await addClusterMutation.mutateAsync({
        data: {
          name: values.name,
          description: values.description,
        },
        fromInfos: [address],
        toLock,
        // @ts-ignore
        capacityMargin: useCapacityMargin ? BI.from(100_000_000) : BI.from(0),
      });

      showSuccess('Cluster Created!', () => {
        router.push(`/cluster/${cluster?.cellOutput.type?.args}`);
      });
      modals.close(modalId);
    },
    [address, lock, getAnyoneCanPayLock, addClusterMutation, modalId, router],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Create New Cluster',
        onClose: close,
        styles: {
          content: {
            minWidth: isMobile ? 'auto' : '500px',
          },
        },
        closeOnEscape: !addClusterMutation.isPending,
        closeOnClickOutside: !addClusterMutation.isPending,
        withCloseButton: !addClusterMutation.isPending,
        children: <CreateClusterModal onSubmit={handleSubmit} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [modalId, addClusterMutation.isPending, handleSubmit, opened, close, isMobile]);

  return {
    open,
    close,
    loading,
  };
}
