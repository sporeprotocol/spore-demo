import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { isNotEmpty, useForm } from '@mantine/form';
import { Button, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAddClusterMutation } from '../mutation/useAddClusterMutation';
import { useConnect } from '../useConnect';

export default function useAddClusterModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock } = useConnect();
  const modalId = useId();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      public: false,
    },

    validate: {
      name: isNotEmpty('Name cannot be empty'),
      description: isNotEmpty('description cannot be empty'),
    },
  });

  const addClusterMutation = useAddClusterMutation();
  const loading = addClusterMutation.isLoading && !addClusterMutation.isError;

  const handleSubmit = useCallback(
    async (values: { name: string; description: string; public: boolean }) => {
      if (!address || !lock) {
        return;
      }
      try {
        let toLock = lock;
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
    [address, lock, addClusterMutation, close],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Add New Cluster',
        onClose: close,
        closeOnEscape: !addClusterMutation.isLoading,
        closeOnClickOutside: !addClusterMutation.isLoading,
        withCloseButton: !addClusterMutation.isLoading,
        children: (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              withAsterisk
              label="Name"
              {...form.getInputProps('name')}
            />

            <TextInput
              withAsterisk
              label="Description"
              {...form.getInputProps('description')}
            />

            <Group position="right" mt="md">
              <Button type="submit" loading={addClusterMutation.isLoading}>
                Submit
              </Button>
            </Group>
          </form>
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    modalId,
    addClusterMutation.isLoading,
    form,
    handleSubmit,
    opened,
    close,
  ]);

  return {
    open,
    close,
    loading,
  };
}
