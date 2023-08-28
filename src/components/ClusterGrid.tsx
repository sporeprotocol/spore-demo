import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { Box, Flex, SimpleGrid, Title } from '@mantine/core';
import ClusterCard, { ClusterSkeletonCard } from './ClusterCard';
import EmptyPlaceholder from './EmptyPlaceholder';
import useCreateClusterModal from '@/hooks/modal/useCreateClusterModal';

export interface ClusterGridProps {
  title: string | JSX.Element;
  clusters: Cluster[];
  spores: Spore[];
  isLoading: boolean;
}

export default function ClusterGrid(props: ClusterGridProps) {
  const { title, clusters, spores, isLoading } = props;
  const createClusterModal = useCreateClusterModal();

  if (!isLoading && clusters.length === 0) {
    return (
      <EmptyPlaceholder
        title="Cluster Creations Await"
        description="Start your imaginative journey by creating Clusters"
        submitLabel="Create Cluster"
        onClick={createClusterModal.open}
      />
    );
  }

  return (
    <Box>
      {typeof title === 'string' ? (
        <Flex>
          <Title order={3}>{title}</Title>
        </Flex>
      ) : (
        title
      )}
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
              return <ClusterSkeletonCard key={`cluster_skeleton_${index}`} />;
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
          {clusters.map((cluster) => {
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
  );
}
