import Banner from '@/components/Banner';
import ClusterCard, { ClusterSkeletonCard } from '@/components/ClusterCard';
import Layout from '@/components/Layout';
import { trpc } from '@/server';
import { Text, Box, Container, Flex, SimpleGrid, Title } from '@mantine/core';
import groupBy from 'lodash-es/groupBy';
import Link from 'next/link';
import { useMemo } from 'react';

export default function HomePage() {
  const { data: clusters = [], isLoading: isClusterLoading } = trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } = trpc.spore.list.useQuery();
  const isLoading = isClusterLoading || isSporesLoading;

  const peekClusters = useMemo(() => {
    const sporesByCluster = groupBy(spores, (spore) => spore.clusterId);
    const ordererClustersId = Object.entries(sporesByCluster)
      .sort(([, aSpores], [_, bSpores]) => aSpores.length - bSpores.length)
      .map(([clusterId]) => clusterId);

    return clusters
      .sort((a, b) => {
        const aIndex = ordererClustersId.indexOf(a.id) ?? 0;
        const bIndex = ordererClustersId.indexOf(b.id) ?? 0;
        return bIndex - aIndex;
      })
      .slice(0, 4);
  }, [clusters, spores]);

  return (
    <Layout>
      <Banner />
      <Container py="48px" size="xl">
        <Box>
          <Flex justify="space-between">
            <Title order={3}>Discover Clusters</Title>
            <Link href="/clusters" style={{ textDecoration: 'none' }}>
              <Text color="brand.1" weight="600">
                See all
              </Text>
            </Link>
          </Flex>
          {isLoading ? (
            <SimpleGrid
              cols={4}
              spacing="24px"
              breakpoints={[
                { maxWidth: '80rem', cols: 3 },
                { maxWidth: '60rem', cols: 2 },
                { maxWidth: '36rem', cols: 1 },
              ]}
              mt="24px"
            >
              {Array(4)
                .fill(0)
                .map((_, index) => {
                  return (
                    <ClusterSkeletonCard key={`cluster_skeleton_${index}`} />
                  );
                })}
            </SimpleGrid>
          ) : (
            <SimpleGrid
              cols={4}
              spacing="24px"
              breakpoints={[
                { maxWidth: '80rem', cols: 3 },
                { maxWidth: '60rem', cols: 2 },
                { maxWidth: '36rem', cols: 1 },
              ]}
              mt="24px"
            >
              {peekClusters.map((cluster) => {
                const clusterSpores = spores.filter(
                  (spore) => spore.clusterId === cluster.id,
                );
                return (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    spores={clusterSpores}
                  />
                );
              })}
            </SimpleGrid>
          )}
        </Box>
      </Container>
    </Layout>
  );
}
