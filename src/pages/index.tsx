import Layout from '@/components/Layout';
import {
  Button,
  Card,
  Group,
  Modal,
  TextInput,
  SimpleGrid,
  Box,
  Flex,
  Switch,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { isNotEmpty, useForm } from '@mantine/form';
import { useCallback, useMemo, useState } from 'react';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { Cluster, createCluster, getClusters } from '@/cluster';
import useConnect from '@/hooks/useConnect';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { helpers } from '@ckb-lumos/lumos';
import { Spore, getSpores } from '@/spore';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';

export async function getStaticProps() {
  const clusters = await getClusters();
  return { props: { clusters, spores: [] } };
}

export interface HomePageProps {
  clusters: Cluster[];
  spores: Spore[];
}

export default function HomePage(props: HomePageProps) {
  const queryClient = useQueryClient();
  const { address, lock, isConnected } = useConnect();
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const clustersQuery = useQuery(['clusters'], getClusters, {
    initialData: props.clusters,
  });
  const sporesQuery = useQuery(['spores'], () => getSpores(), {
    initialData: props.spores,
  });
  const createMutaion = useMutation(createCluster, {
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const clusters = useMemo(() => {
    const allClusters = clustersQuery.data || [];
    if (showOnlyMine) {
      return allClusters.filter(({ cell }) => {
        return helpers.encodeToAddress(cell.cellOutput.lock) === address;
      });
    }
    return allClusters;
  }, [clustersQuery.data, showOnlyMine, address]);

  const spores = useMemo(() => {
    const allSpores = sporesQuery.data || [];
    if (showOnlyMine) {
      return allSpores.filter(({ cell }) => {
        return helpers.encodeToAddress(cell.cellOutput.lock) === address;
      });
    }
    return allSpores;
  }, [address, showOnlyMine, sporesQuery.data]);

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

      <Box mt="md">
        <Box>
          <Switch
            label="Only show what I own"
            checked={showOnlyMine}
            onClick={() => setShowOnlyMine(!showOnlyMine)}
          />
        </Box>

        <Box mt="md">
          <Title order={2}>Clusters</Title>
          <SimpleGrid cols={4} mt="sm">
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
              <ClusterCard key={cluster.id} cluster={cluster} />
            ))}
          </SimpleGrid>
        </Box>

        <Box mt="md">
          <Title order={2}>Spores</Title>
          <SimpleGrid cols={4} mt="sm">
            {spores.map((spore: Spore) => (
              <SporeCard key={spore.id} spore={spore} />
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Layout>
  );
}
