import Layout from '@/components/Layout';
import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { isNotEmpty, useForm } from '@mantine/form';
import { useCallback } from 'react';
import { createCluster, predefinedSporeConfigs } from '@spore-sdk/core';
import { useAccount } from 'wagmi';
import useCkbAddress from '@/hooks/useCkbAddress';
import useSendTransaction from '@/hooks/useSendTransaction';

export default function Home() {
  const { address: ethAddress } = useAccount();
  const { address, lock } = useCkbAddress(ethAddress);
  const { sendTransaction } = useSendTransaction();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
    },

    validate: {
      name: isNotEmpty('Name cannot be empty'),
      description: isNotEmpty('description cannot be empty'),
    },
  });

  const handleSubmit = useCallback(
    async (values: { name: string; description: string }) => {
      if (!address) {
        return;
      }
      console.log(address);
      let { txSkeleton } = await createCluster({
        clusterData: {
          name: values.name,
          description: values.description,
        },
        fromInfos: [address],
        toLock: lock,
        config: predefinedSporeConfigs.Aggron4,
      });
      const txHash = await sendTransaction(txSkeleton);
      console.log(txHash);
    },
    [address, lock, sendTransaction],
  );

  return (
    <Layout>
      <Modal opened={opened} onClose={close} title="Create Cluster">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            withAsterisk
            label="Name"
            placeholder="Your Cluster Name"
            {...form.getInputProps('name')}
          />

          <TextInput
            withAsterisk
            label="Description"
            {...form.getInputProps('description')}
          />

          <Group position="right" mt="md">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Modal>

      <Group position="center">
        <Button onClick={open}>Create Cluster</Button>
      </Group>
    </Layout>
  );
}
