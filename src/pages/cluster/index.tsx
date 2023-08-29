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

const useStyles = createStyles(
  (theme, params: { showMintableOnly: boolean }) => ({
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

export default function ClustersPage() {
  const { lock } = useConnect();
  const [showMintableOnly, setShowMintableOnly] = useState(false);
  const { classes } = useStyles({ showMintableOnly });

  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery();

  const isLoading = isClusterLoading || isSporesLoading;

  const displayClusters = useMemo(() => {
    if (showMintableOnly) {
      return clusters.filter(({ cell }) => {
        return (
          isAnyoneCanPay(cell.cellOutput.lock) ||
          isSameScript(lock, cell.cellOutput.lock)
        );
      });
    }
    return clusters;
  }, [clusters, showMintableOnly, lock]);

  return (
    <Layout>
      <Head>
        <title>All Clusters - Spore Demo</title>
      </Head>
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
          <ClusterGrid
            title={
              <Flex justify="space-between" align="center">
                <Title order={3}>Explore All Clusters</Title>
                <Switch
                  size="16px"
                  label="Only show Clusters I can mint"
                  classNames={{ track: classes.track, thumb: classes.thumb }}
                  checked={showMintableOnly}
                  onChange={(event) =>
                    setShowMintableOnly(event.currentTarget.checked)
                  }
                />
              </Flex>
            }
            clusters={displayClusters}
            spores={spores}
            isLoading={isLoading}
          />
        </Box>
      </Container>
    </Layout>
  );
}
