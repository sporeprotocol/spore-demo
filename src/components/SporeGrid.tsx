import { Spore } from '@/spore';
import { Box, Container, Flex, SimpleGrid, Title } from '@mantine/core';
import SporeCard, { SporeSkeletonCard } from './SporeCard';
import { Cluster } from '@/cluster';

export interface SporeGridProps {
  title: string;
  spores: Spore[];
  cluster:
    | ((clusterId: string | null) => Cluster | undefined)
    | Cluster
    | undefined;
  isLoading: boolean;
}

export default function SporeGrid(props: SporeGridProps) {
  const { title, spores, isLoading } = props;

  return (
    <Box>
      <Flex>
        <Title order={3}>{title}</Title>
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
              return <SporeSkeletonCard key={`spore_skeleton_${index}`} />;
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
          {spores.map((spore) => {
            const cluster =
              typeof props.cluster === 'function'
                ? props.cluster(spore.clusterId)
                : props.cluster;
            return <SporeCard key={spore.id} spore={spore} cluster={cluster} />;
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
