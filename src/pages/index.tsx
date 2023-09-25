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
  Group,
  Button,
} from '@mantine/core';
import groupBy from 'lodash-es/groupBy';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import SporeGrid from '@/components/SporeGrid';
import ClusterGrid from '@/components/ClusterGrid';
import { useMediaQuery } from '@mantine/hooks';
import { IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { TEXT_MIME_TYPE } from '@/utils/mime';

enum SporeContentType {
  All = 'All',
  Image = 'Image',
  Text = 'Text',
}

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
  type: {
    height: '32px',
    border: '1px solid #CDCFD5',
    backgroundColor: '#FFF',
    borderRadius: '20px',
    paddingLeft: '16px',
    paddingRight: '16px',
    cursor: 'pointer',
  },
  active: {
    backgroundColor: theme.colors.brand[1],
    color: '#FFF',
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
}));

export default function HomePage() {
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [contentType, setContentType] = useState(SporeContentType.All);
  const [sporeCount, setSporeCount] = useState<number>(12);

  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery();

  const isLoading = isClusterLoading || isSporesLoading;

  const filteredSpores = useMemo(() => {
    if (contentType === SporeContentType.All) {
      return spores;
    }
    if (contentType === SporeContentType.Image) {
      return spores.filter((spore) =>
        IMAGE_MIME_TYPE.includes(spore.contentType as any),
      );
    }
    if (contentType === SporeContentType.Text) {
      return spores.filter((spore) =>
        TEXT_MIME_TYPE.includes(spore.contentType as any),
      );
    }
    return spores;
  }, [spores, contentType]);

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
                width={isMobile ? '213' : '331'}
                height={isMobile ? '96' : '136'}
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
      <Box bg="background.0">
        <Container py="48px" size="xl">
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
        </Container>
      </Box>
      <Container py="48px" size="xl">
        <SporeGrid
          title="Explore All Spores"
          spores={filteredSpores.slice(0, sporeCount)}
          cluster={(id) => clusters.find((c) => c.id === id) ?? undefined}
          filter={
            <Group mt="16px">
              {[
                SporeContentType.All,
                SporeContentType.Image,
                SporeContentType.Text,
              ].map((type) => {
                return (
                  <Flex
                    key={type}
                    align="center"
                    className={cx(classes.type, {
                      [classes.active]: type === contentType,
                    })}
                    onClick={() => setContentType(type)}
                  >
                    <Text>{type}</Text>
                  </Flex>
                );
              })}
            </Group>
          }
          isLoading={isSporesLoading}
        />
        {sporeCount < filteredSpores.length && (
          <Group position="center" mt="48px">
            <Button
              className={classes.more}
              onClick={() =>
                setSporeCount(Math.min(filteredSpores.length, sporeCount + 12))
              }
            >
              Load More
            </Button>
          </Group>
        )}
      </Container>
    </Layout>
  );
}
