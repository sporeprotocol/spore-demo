import Layout from '@/components/Layout';
import { SimpleGrid, Box, Title } from '@mantine/core';
import { useMemo } from 'react';
import { Cluster, getClusters } from '@/cluster';
import { Spore, getSpores } from '@/spore';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';
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
  const clustersQuery = useClustersQuery(props.clusters);
  const sporesQuery = useSporesQuery(props.spores);

  const clusters = useMemo(
    () => clustersQuery.data || [],
    [clustersQuery.data],
  );
  const spores = useMemo(() => sporesQuery.data || [], [sporesQuery.data]);

  return (
    <Layout>
      <Box mt="md">
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
      </Box>
    </Layout>
  );
}
