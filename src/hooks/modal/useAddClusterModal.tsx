import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useAddClusterMutation } from '../mutation/useAddClusterMutation';
import { useConnect } from '../useConnect';
import CreateClusterModal from '@/components/CreateClusterModal';

export default function useAddClusterModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, getAnyoneCanPayLock } = useConnect();
  const modalId = useId();

  const addClusterMutation = useAddClusterMutation();
  const loading = addClusterMutation.isLoading && !addClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { name: string; description: string; public: string }) => {
      if (!address || !lock) {
        return;
      }
      try {
        const toLock = values.public === '1' ? getAnyoneCanPayLock() : lock;
        await addClusterMutation.mutateAsync({
          data: {
            name: values.name,
            description: values.description,
          },
          fromInfos: [address],
          toLock,
          config: predefinedSporeConfigs.Aggron4,
        });

        notifications.show({
          color: 'green',
          title: 'Congratulations!',
          message: 'Your cluster has been created.',
        });
        close();
      } catch (e) {
        notifications.show({
          color: 'red',
          title: 'Error!',
          message: (e as Error).message,
        });
      }
    },
    [address, lock, getAnyoneCanPayLock, addClusterMutation, close],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Create New Cluster',
        onClose: close,
        closeOnEscape: !addClusterMutation.isLoading,
        closeOnClickOutside: !addClusterMutation.isLoading,
        withCloseButton: !addClusterMutation.isLoading,
        children: (
          <CreateClusterModal
            onSubmit={handleSubmit}
            isLoading={addClusterMutation.isLoading}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [modalId, addClusterMutation.isLoading, handleSubmit, opened, close]);

  return {
    open,
    close,
    loading,
  };
}
