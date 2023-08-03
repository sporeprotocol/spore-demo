import { createCluster, predefinedSporeConfigs } from '@spore-sdk/core';
import useWalletConnect from './useWalletConnect';
import { RPC, Script, commons, config, helpers } from '@ckb-lumos/lumos';
import { waitForTranscation } from '@/transaction';
import { useCallback, useEffect } from 'react';
import { useMutation } from 'wagmi';
import { useQueryClient } from 'react-query';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { isNotEmpty, useForm } from '@mantine/form';
import { Button, Checkbox, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export default function useAddClusterModal() {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, signTransaction } = useWalletConnect();

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

  const addCluster = useCallback(
    async (...args: Parameters<typeof createCluster>) => {
      const rpc = new RPC(predefinedSporeConfigs.Aggron4.ckbNodeUrl);
      const { txSkeleton } = await createCluster(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await rpc.sendTransaction(signedTx, 'passthrough');
      await waitForTranscation(hash);
      return hash;
    },
    [signTransaction],
  );

  const addClusterMutation = useMutation(addCluster, {
    onSuccess: () => {
      queryClient.invalidateQueries('clusters');
    },
  });
  const loading = addClusterMutation.isLoading;

  const handleSubmit = useCallback(
    async (values: { name: string; description: string; public: boolean }) => {
      if (!address || !lock) {
        return;
      }
      try {
        let toLock = lock;
        if (values.public) {
          const anyoneCanPayScript =
            config.predefined.AGGRON4.SCRIPTS['ANYONE_CAN_PAY'];
          toLock = {
            codeHash: anyoneCanPayScript.CODE_HASH,
            hashType: anyoneCanPayScript.HASH_TYPE,
            args: lock.args,
          } as Script;
        }

        await addClusterMutation.mutateAsync({
          clusterData: {
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
        console.log(e);
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
        modalId: 'add-cluster',
        title: 'Add New Cluster',
        onClose: close,
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

            <Checkbox
              mt="md"
              label="Make the cluster public so that others can create it."
              {...form.getInputProps('public', { type: 'checkbox' })}
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
      modals.close('add-cluster');
    }
  }, [addClusterMutation.isLoading, form, handleSubmit, opened, close]);

  return {
    open,
    close,
    loading,
  };
}
