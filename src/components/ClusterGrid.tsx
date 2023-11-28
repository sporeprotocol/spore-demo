import { Box, Flex, SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import ClusterCard, { ClusterSkeletonCard } from './ClusterCard';
import EmptyPlaceholder from './EmptyPlaceholder';
import useCreateClusterModal from '@/hooks/modal/useCreateClusterModal';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { QueryCluster } from '@/hooks/query/type';

export interface ClusterGridProps {
  title: string | JSX.Element;
  clusters: QueryCluster[];
  isLoading: boolean;
  disablePlaceholder?: boolean;
}

export default function ClusterGrid(props: ClusterGridProps) {
  const { title, clusters, isLoading, disablePlaceholder } = props;
  const router = useRouter();
  const theme = useMantineTheme();
  const md = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const lg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);
  const loadingCount = useMemo(() => {
    if (!md && lg) return 3;
    if (md) return 2;
    return 4;
  }, [md, lg]);

  const createClusterModal = useCreateClusterModal();

  if (!disablePlaceholder && !isLoading && clusters.length === 0) {
    if (router.pathname === '/my') {
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
      <EmptyPlaceholder
        title="No Clusters Found"
        description="This user hasn’t minted any spores yet. Feel free to discover a world of creativity elsewhere!"
        submitLabel="Explore"
        onClick={() => router.push('/')}
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
            { maxWidth: theme.breakpoints.lg, cols: 3 },
            { maxWidth: theme.breakpoints.md, cols: 2 },
            { maxWidth: theme.breakpoints.xs, cols: 1 },
          ]}
          mt="24px"
        >
          {Array(loadingCount)
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
            { maxWidth: theme.breakpoints.lg, cols: 3 },
            { maxWidth: theme.breakpoints.md, cols: 2 },
            { maxWidth: theme.breakpoints.xs, cols: 1 },
          ]}
          mt="24px"
        >
          {clusters.map((cluster) => {
            return <ClusterCard key={cluster.id} cluster={cluster} />;
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
