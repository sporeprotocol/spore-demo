import Layout from '@/components/Layout';
import { trpc } from '@/server';
import Image from 'next/image';
import {
  Text,
  Box,
  Container,
  Flex,
  createStyles,
  MediaQuery,
  Title,
  Switch,
} from '@mantine/core';
import ClusterGrid from '@/components/ClusterGrid';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { isAnyoneCanPay, isSameScript } from '@/utils/script';
import { useConnect } from '@/hooks/useConnect';
import groupBy from 'lodash-es/groupBy';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers';

const useStyles = createStyles(
  (theme, params: { showMintableOnly: boolean }) => ({
    banner: {
      height: '280px',
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
      right: '-330px',
      top: '-48px',
    },
    track: {
      backgroundColor: 'transparent !important',
      borderWidth: '2px',
      borderColor:
        (params.showMintableOnly
          ? theme.colors.brand[1]
          : theme.colors.text[2]) + '!important',
      width: '40px',
      height: '24px',
      cursor: 'pointer',
    },
    thumb: {
      backgroundColor:
        (params.showMintableOnly
          ? theme.colors.brand[1]
          : theme.colors.text[2]) + '!important',
    },
  }),
);

export async function getStaticProps() {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
  });
  await Promise.all([
    helpers.cluster.list.prefetch(),
    helpers.spore.list.prefetch(),
  ]);

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
    revalidate: 1,
  };
}

export default function ClustersPage() {
  const { lock } = useConnect();
  const [showMintableOnly, setShowMintableOnly] = useState(false);
  const { classes } = useStyles({ showMintableOnly });

  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery();

  const isLoading = isClusterLoading || isSporesLoading;

  const sortedClusters = useMemo(() => {
    const sporesByCluster = groupBy(spores, (spore) => spore.clusterId);
    const ordererClustersId = Object.entries(sporesByCluster)
      .sort(([, aSpores], [_, bSpores]) => aSpores.length - bSpores.length)
      .map(([clusterId]) => clusterId);

    return clusters.sort((a, b) => {
      const aIndex = ordererClustersId.indexOf(a.id) ?? 0;
      const bIndex = ordererClustersId.indexOf(b.id) ?? 0;
      return bIndex - aIndex;
    });
  }, [clusters, spores]);

  const displayClusters = useMemo(() => {
    if (showMintableOnly) {
      return sortedClusters.filter(({ cell }) => {
        return (
          isAnyoneCanPay(cell.cellOutput.lock) ||
          isSameScript(lock, cell.cellOutput.lock)
        );
      });
    }
    return sortedClusters;
  }, [sortedClusters, showMintableOnly, lock]);

  const header = (
    <Flex align="center" className={classes.banner}>
      <Container size="xl" className={classes.container}>
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
          <MediaQuery smallerThan="xs" styles={{ display: 'none' }}>
            <Image
              src="/images/clusters-title.png"
              width="766"
              height="60"
              alt="Spore Demo"
            />
          </MediaQuery>
          <MediaQuery largerThan="xs" styles={{ display: 'none' }}>
            <Image
              src="/images/clusters-title.mobile.png"
              width="350"
              height="96"
              alt="Spore Demo"
            />
          </MediaQuery>

          <Text size="xl" align="center">
            Transform your imaginative visions into vibrant Clusters!
          </Text>
        </Flex>
      </Container>
    </Flex>
  );

  return (
    <Layout header={header}>
      <Head>
        <title>All Clusters - Spore Demo</title>
      </Head>
      <Container py="48px" size="xl">
        <Box mb="60px">
          <ClusterGrid
            title={
              <Flex
                direction={{ base: 'column', xs: 'row' }}
                gap={{ base: 'md', xs: 'none' }}
                justify="space-between"
                align={{ base: 'start', xs: 'center' }}
              >
                <Title order={3}>Explore All Clusters</Title>
                <Switch
                  size="16px"
                  label="Only show Clusters I can mint into"
                  classNames={{ track: classes.track, thumb: classes.thumb }}
                  checked={showMintableOnly}
                  onChange={(event) =>
                    setShowMintableOnly(event.currentTarget.checked)
                  }
                />
              </Flex>
            }
            clusters={displayClusters.map((cluster) => {
              const clusterSpores = spores.filter(
                (spore) => spore.clusterId === cluster.id,
              );
              return {
                ...cluster,
                spores: clusterSpores,
              };
            })}
            isLoading={isLoading}
          />
        </Box>
      </Container>
    </Layout>
  );
}
