import ClusterGrid from '@/components/ClusterGrid';
import Layout from '@/components/Layout';
import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Loader,
  MediaQuery,
  Switch,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteClustersQuery } from '@/hooks/query/useInfiniteClustersQuery';
import { QueryCluster } from '@/hooks/query/type';
import { useConnect } from '@/hooks/useConnect';
import { useMintableClustersQuery } from '@/hooks/query/useMintableClusters';

export const useStyles = createStyles(
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
    more: {
      color: theme.colors.brand[1],
      backgroundColor: 'transparent',
      borderWidth: '2px',
      borderColor: theme.colors.brand[1],
      borderStyle: 'solid',
      boxShadow: 'none !important',

      '&:hover': {
        backgroundColor: theme.colors.brand[1],
        color: theme.white,
      },
    },
  }),
);

export default function ClustersPage() {
  const { address } = useConnect();
  const [showMintableOnly, setShowMintableOnly] = useState(false);
  const { classes } = useStyles({ showMintableOnly });
  const loadMoreButtonRef = useRef<HTMLButtonElement>(null);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, status } =
    useInfiniteClustersQuery();
  const { data: mintableClusters = [] } = useMintableClustersQuery(address);

  useEffect(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    });
    if (loadMoreButtonRef.current) {
      observer.observe(loadMoreButtonRef.current);
    }
    return () => observer.disconnect();
  }, [fetchNextPage, isFetchingNextPage, hasNextPage]);

  const clusters = useMemo(() => {
    if (!data) {
      return [] as QueryCluster[];
    }
    const { pages } = data;
    const clusters = pages?.flatMap((page) => page?.clusters ?? []);
    return clusters as QueryCluster[];
  }, [data]);

  const displayClusters = useMemo(() => {
    if (showMintableOnly) {
      return clusters.filter(({ id }) =>
        mintableClusters.some((c) => c.id === id),
      );
    }
    return clusters;
  }, [showMintableOnly, clusters, mintableClusters]);

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
            clusters={displayClusters}
            isLoading={status === 'pending'}
          />
          <Group position="center" mt="48px">
            {hasNextPage &&
              (isFetchingNextPage ? (
                <Loader color="brand.1" />
              ) : (
                <Button
                  ref={loadMoreButtonRef}
                  className={classes.more}
                  onClick={() => fetchNextPage()}
                >
                  Load More
                </Button>
              ))}
          </Group>
        </Box>
      </Container>
    </Layout>
  );
}
