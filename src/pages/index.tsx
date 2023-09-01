import Layout from '@/components/Layout';
import { trpc } from '@/server';
import {
  Text,
  Box,
  Container,
  Flex,
  Title,
  Image,
  createStyles,
  MediaQuery,
  useMantineTheme,
} from '@mantine/core';
import groupBy from 'lodash-es/groupBy';
import Link from 'next/link';
import { useMemo } from 'react';
import SporeGrid from '@/components/SporeGrid';
import ClusterGrid from '@/components/ClusterGrid';
import { useMediaQuery } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  banner: {
    minHeight: '280px',
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',

    [theme.fn.smallerThan('sm')]: {
      minHeight: '232px',
    },
  },

  container: {
    position: 'relative',
  },

  illus: {
    position: 'absolute',
    left: '-387px',
    top: '-25px',
  },
}));

export default function HomePage() {
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const smallerThenXS = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery();

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

  const header = (
    <Flex align="center" className={classes.banner}>
      <Container size="xl" className={classes.container}>
        <MediaQuery
          query={`(max-width: ${theme.breakpoints.lg})`}
          styles={{ display: 'none' }}
        >
          <Image
            className={classes.illus}
            src="/svg/spore-demo-illus.svg"
            width="339"
            height="315"
            alt="Spore Demo Illus"
          />
        </MediaQuery>
        <Flex direction="column" justify="center" align="center" gap="32px">
          <Box>
            <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
              <Image
                src={'/images/demo-title.png'}
                width="630"
                height="60"
                alt="Spore Demo"
              />
            </MediaQuery>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Image
                src={'/images/demo-title.mobile.png'}
                width={smallerThenXS ? '213' : '331'}
                height={smallerThenXS ? '96' : '136'}
                alt="Spore Demo"
              />
            </MediaQuery>
          </Box>

          <Text size="xl" align="center">
            Connect your wallet, mint a spore, start your cluster – all
            on-chain!
          </Text>
        </Flex>
      </Container>
    </Flex>
  );

  return (
    <Layout header={header}>
      <Container py="48px" size="xl">
        <Box mb="60px">
          <ClusterGrid
            title={
              <Flex justify="space-between">
                <Title order={3}>Discover Clusters</Title>
                <Link href="/cluster" style={{ textDecoration: 'none' }}>
                  <Text color="brand.1" weight="600">
                    See all
                  </Text>
                </Link>
              </Flex>
            }
            clusters={peekClusters}
            spores={spores}
            isLoading={isLoading}
          />
        </Box>
        <SporeGrid
          title="Explore All Spores"
          spores={spores}
          cluster={(id) => clusters.find((c) => c.id === id) ?? undefined}
          isLoading={isSporesLoading}
        />
      </Container>
    </Layout>
  );
}
