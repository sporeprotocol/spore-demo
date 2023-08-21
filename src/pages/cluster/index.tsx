import ClusterCard, { ClusterSkeletonCard } from '@/components/ClusterCard';
import Layout from '@/components/Layout';
import { trpc } from '@/server';
import Image from 'next/image';
import {
  Text,
  Box,
  Container,
  Flex,
  SimpleGrid,
  Title,
  createStyles,
  MediaQuery,
} from '@mantine/core';

const useStyles = createStyles((theme) => ({
  banner: {
    height: '280px',
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },

  container: {
    position: 'relative',
  },

  illus: {
    position: 'absolute',
    right: '-330px',
    top: '-48px',
  },
}));

export default function ClustersPage() {
  const { classes } = useStyles();

  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery();

  const isLoading = isClusterLoading || isSporesLoading;

  return (
    <Layout>
      <Flex align="center" className={classes.banner}>
        <Container size="xl" mt="80px" className={classes.container}>
          <MediaQuery query="(max-width: 80rem)" styles={{ display: 'none' }}>
            <Image
              className={classes.illus}
              src="/svg/all-clusters-illus.svg"
              width="358"
              height="358"
              alt="Spore Demo Illus"
            />
          </MediaQuery>
          <Flex direction="column" justify="center" align="center" gap="32px">
            <Image
              src="/images/clusters-title.png"
              width="766"
              height="60"
              layout="responsive"
              alt="Spore Demo"
            />

            <Text size="xl" align="center">
              Transform your imaginative visions into vibrant Clusters!
            </Text>
          </Flex>
        </Container>
      </Flex>
      <Container py="48px" size="xl">
        <Box mb="60px">
          <Flex>
            <Title order={3}>Explore All Clusters</Title>
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
      </Container>
    </Layout>
  );
}
