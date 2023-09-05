import { useCallback, useEffect } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnect } from '../useConnect';
import CreateClusterModal from '@/components/CreateClusterModal';
import { createCluster, predefinedSporeConfigs } from '@spore-sdk/core';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import { showSuccess } from '@/utils/notifications';
import { useRouter } from 'next/router';
import { useMantineTheme } from '@mantine/core';

export default function useCreateClusterModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const theme = useMantineTheme();
  const largerThanSM = useMediaQuery(`(min-width: ${theme.breakpoints.sm})`);
  const { address, lock, getAnyoneCanPayLock, signTransaction } = useConnect();
  const modalId = useId();

  const { refetch } = trpc.cluster.list.useQuery(undefined, {
    enabled: false,
  });

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

  const addClusterMutation = useMutation(addCluster, {
    onSuccess: () => {
      refetch();
    },
  });
  const loading = addClusterMutation.isLoading && !addClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { name: string; description: string; public: string }) => {
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
        config: predefinedSporeConfigs.Aggron4,
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
            minWidth: largerThanSM ? '500px' : 'auto',
          },
        },
        closeOnEscape: !addClusterMutation.isLoading,
        closeOnClickOutside: !addClusterMutation.isLoading,
        withCloseButton: !addClusterMutation.isLoading,
        children: <CreateClusterModal onSubmit={handleSubmit} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [modalId, addClusterMutation.isLoading, handleSubmit, opened, close, largerThanSM]);

  return {
    open,
    close,
    loading,
  };
}
