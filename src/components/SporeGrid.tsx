import { Spore } from '@/spore';
import { Box, Flex, SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import SporeCard, { SporeSkeletonCard } from './SporeCard';
import { Cluster } from '@/cluster';
import EmptyPlaceholder from './EmptyPlaceholder';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@mantine/hooks';
import { useMemo } from 'react';

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
  const router = useRouter();
  const theme = useMantineTheme();
  const md = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const lg = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);
  const loadingCount = useMemo(() => {
    if (!md && lg) return 3;
    if (md) return 2;
    return 4;
  }, [md, lg]);

  const mintSporeModal = useMintSporeModal();

  if (!isLoading && spores.length === 0) {
    if (router.pathname === '/my') {
      return (
        <EmptyPlaceholder
          title="Spore Creations Await"
          description="Let your creativity bloom and cultivate unique Spores with your imagination!"
          submitLabel="Mint Spore"
          onClick={mintSporeModal.open}
        />
      );
    }

    return (
      <EmptyPlaceholder
        title="No Spores Found"
        description="This user hasn’t minted any spores yet. Feel free to discover a world of creativity elsewhere!"
        submitLabel="Explore"
        onClick={() => router.push('/')}
      />
    );
  }

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
            { maxWidth: theme.breakpoints.lg, cols: 3 },
            { maxWidth: theme.breakpoints.md, cols: 2 },
            { maxWidth: theme.breakpoints.xs, cols: 1 },
          ]}
          mt="24px"
        >
          {Array(loadingCount)
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
            { maxWidth: theme.breakpoints.lg, cols: 3 },
            { maxWidth: theme.breakpoints.md, cols: 2 },
            { maxWidth: theme.breakpoints.xs, cols: 1 },
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
