import { Box, Flex, SimpleGrid, Title, useMantineTheme } from '@mantine/core';
import SporeCard, { SporeSkeletonCard } from './SporeCard';
import EmptyPlaceholder from './EmptyPlaceholder';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import { useRouter } from 'next/router';
import { QuerySpore } from '@/hooks/query/type';

export interface SporeGridProps {
  title: string;
  spores: QuerySpore[];
  isLoading: boolean;
  filter?: React.ReactNode;
  disablePlaceholder?: boolean;
}

export default function SporeGrid(props: SporeGridProps) {
  const { title, spores, isLoading, disablePlaceholder } = props;
  const router = useRouter();
  const theme = useMantineTheme();

  const mintSporeModal = useMintSporeModal();

  if (!disablePlaceholder && !isLoading && spores.length === 0) {
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
      {props.filter}
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
          {Array(12)
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
            return <SporeCard key={spore.id} spore={spore} />;
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}
