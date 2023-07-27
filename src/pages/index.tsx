import Layout from '@/components/Layout';
import {
  Text,
  Button,
  Card,
  Group,
  Modal,
  TextInput,
  SimpleGrid,
  Box,
  Flex,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { isNotEmpty, useForm } from '@mantine/form';
import { useCallback, useMemo } from 'react';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { Cluster, createCluster, getClusters } from '@/cluster';
import useConnect from '@/hooks/useConnect';
import { useMutation, useQuery, useQueryClient } from 'react-query';

export async function getStaticProps() {
  const clusters = await getClusters();
  return { props: { clusters } };
}

export default function HomePage(props: { clusters: Cluster[] }) {
  const queryClient = useQueryClient();
  const { address, lock, isConnected } = useConnect();
  const [opened, { open, close }] = useDisclosure(false);
  const clustersQuery = useQuery(['clusters'], getClusters, {
    initialData: props.clusters,
  });
  const createMutaion = useMutation(createCluster, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const clusters = useMemo(
    () => clustersQuery.data || [],
    [clustersQuery.data],
  );

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
      if (!address || !lock) {
        return;
      }
      try {
        const txHash = await createMutaion.mutateAsync({
          clusterData: {
            name: values.name,
            description: values.description,
          },
          fromInfos: [address],
          toLock: lock,
          config: predefinedSporeConfigs.Aggron4,
        });
        console.log(txHash);
        close();
      } catch (e) {
        notifications.show({
          color: 'red',
          title: 'Failed',
          message: (e as Error).message || `Failed to create cluster`,
        });
      }
    },
    [address, lock, createMutaion, close],
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

      <Box mt={12}>
        <SimpleGrid cols={4}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Box
              sx={{
                height: '100%',
                cursor: isConnected ? 'pointer' : 'not-allowed',
              }}
              onClick={() => isConnected && open()}
            >
              <Flex direction="row" h="100%" justify="center" align="center">
                <IconPlus size={50} color="gray" />
              </Flex>
            </Box>
          </Card>
          {clusters.map((cluster: Cluster) => (
            <Card
              key={cluster.id}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
            >
              <Group position="apart">
                <Text weight={500}>{cluster.name}</Text>
              </Group>
              <Text size="sm" color="dimmed">
                {cluster.description}
              </Text>
              <Link
                href={`/cluster/${cluster.id}`}
                style={{ textDecoration: 'none' }}
                passHref
              >
                <Button
                  variant="light"
                  color="blue"
                  fullWidth
                  mt="md"
                  radius="md"
                >
                  Show Spores
                </Button>
              </Link>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </Layout>
  );
}
