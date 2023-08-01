import Layout from '@/components/Layout';
import { Card, SimpleGrid, Box, Flex, Switch, Title } from '@mantine/core';
import { useMemo, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Cluster, getClusters } from '@/cluster';
import { helpers } from '@ckb-lumos/lumos';
import { Spore, getSpores } from '@/spore';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';
import useWalletConnect from '@/hooks/useWalletConnect';
import useAddClusterModal from '@/hooks/useAddClusterModal';
import useAddSporeModal from '@/hooks/useAddSporeModal';
import { GetStaticProps } from 'next';
import useClustersQuery from '@/hooks/useClustersQuery';
import useSporesQuery from '@/hooks/useSporesQuery';

export interface HomePageProps {
  clusters: Cluster[];
  spores: Spore[];
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const clusters = await getClusters();
  const spores = await getSpores();
  return { props: { clusters, spores } };
};

export default function HomePage(props: HomePageProps) {
  const { address, connected } = useWalletConnect();
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const addClusterModal = useAddClusterModal();
  const addSporeModal = useAddSporeModal();

  const clustersQuery = useClustersQuery(props.clusters);
  const sporesQuery = useSporesQuery(props.spores);

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

  return (
    <Layout>
      <Box mt="md">
        {connected && (
          <Box mb="md">
            <Switch
              label="Only Mine"
              checked={showOnlyMine}
              onClick={() => setShowOnlyMine(!showOnlyMine)}
            />
          </Box>
        )}

        <Box>
          <Title order={2}>Clusters</Title>
          <SimpleGrid cols={4} mt="sm">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Box
                sx={{
                  height: '100%',
                  cursor: connected ? 'pointer' : 'not-allowed',
                }}
                onClick={() => connected && addClusterModal.open()}
              >
                <Flex direction="row" h="100%" justify="center" align="center">
                  <IconPlus size={50} color="gray" />
                </Flex>
              </Box>
            </Card>
            {clusters.map((cluster: Cluster) => (
              <ClusterCard
                key={cluster.id}
                cluster={cluster}
                spores={spores.filter((s) => s.clusterId === cluster.id)}
              />
            ))}
          </SimpleGrid>
        </Box>

        <Box mt="md">
          <Title order={2}>Spores</Title>
          <SimpleGrid cols={4} mt="sm">
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Box
                sx={{
                  height: '100%',
                  cursor: connected ? 'pointer' : 'not-allowed',
                }}
                onClick={() => connected && addSporeModal.open()}
              >
                <Flex direction="row" h="100%" justify="center" align="center">
                  <IconPlus size={50} color="gray" />
                </Flex>
              </Box>
            </Card>
            {spores.map((spore: Spore) => (
              <SporeCard
                key={spore.id}
                spore={spore}
                cluster={clusters.find((c) => c.id === spore.clusterId)}
              />
            ))}
          </SimpleGrid>
        </Box>
      </Box>
    </Layout>
  );
}
