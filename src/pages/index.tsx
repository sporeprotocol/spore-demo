import Layout from '@/components/Layout';
import { SimpleGrid, Box, Title } from '@mantine/core';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';
import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { trpc } from '@/server';

export default function HomePage() {
  const { data: clusters = [] } = trpc.cluster.list.useQuery();
  const { data: spores = [] } = trpc.spore.list.useQuery();

  return (
    <Layout>
      <Box mt="md">
        {clusters.length > 0 && (
          <Box>
            <Title order={2}>All Cluster</Title>
            <SimpleGrid cols={4} mt="sm">
              {clusters.map((cluster: Cluster) => (
                <ClusterCard
                  key={cluster.id}
                  cluster={cluster}
                  spores={spores.filter((s) => s.clusterId === cluster.id)}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}
        {spores.length > 0 && (
          <Box mt="xl">
            <Title order={2}>All Spore</Title>
            <SimpleGrid cols={4} mt="sm">
              {spores.map((spore: Spore) => (
                <SporeCard
                  key={spore.id}
                  spore={spore}
                  cluster={clusters.find((c) => c.id === spore.clusterId)}
                />
              ))}
            </SimpleGrid>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
