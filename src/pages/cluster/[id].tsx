import 'react-loading-skeleton/dist/skeleton.css';
import Layout from '@/components/Layout';
import SporeGrid from '@/components/SporeGrid';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import useTransferClusterModal from '@/hooks/modal/useTransferClusterModal';
import { useConnect } from '@/hooks/useConnect';
import { trpc } from '@/server';
import { isAnyoneCanPay } from '@/utils/script';
import { helpers } from '@ckb-lumos/lumos';
import {
  Text,
  Flex,
  createStyles,
  Container,
  Grid,
  Button,
  useMantineTheme,
  Box,
  Tooltip,
  Title,
} from '@mantine/core';
import { useClipboard, useMediaQuery } from '@mantine/hooks';
import { IconCopy } from '@tabler/icons-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ClusterOpenGraph } from '@/components/OpenGraph';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import ClusterService from '@/cluster';
import { showSuccess } from '@/utils/notifications';

export async function getStaticProps(
  context: GetStaticPropsContext<{ id: string }>,
) {
  const id = context.params?.id as string;
  return {
    props: {
      id,
    },
  };
}
export const getStaticPaths: GetStaticPaths = async () => {
  const clusters = await ClusterService.shared.list();
  return {
    paths: clusters.map((cluster) => ({
      params: {
        id: cluster.id,
      },
    })),
    fallback: 'blocking',
  };
};

const useStyles = createStyles((theme) => ({
  header: {
    height: '280px',
    overflow: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',

    [theme.fn.largerThan('sm')]: {
      paddingLeft: '40px',
      paddingRight: '40px',
    },

    [theme.fn.smallerThan('sm')]: {
      minHeight: '452px',
    },
  },
  name: {
    textOverflow: 'ellipsis',
    maxWidth: '574px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',

    [theme.fn.smallerThan('sm')]: {
      maxWidth: '99vw',
    },
  },
  description: {
    textOverflow: 'ellipsis',
    maxWidth: '690px ',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  button: {
    color: theme.colors.text[0],
    backgroundColor: theme.colors.brand[0],
    borderWidth: '2px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: 'none !important',

    '&:hover': {
      backgroundColor: theme.colors.text[0],
      color: theme.white,
    },
  },
}));

export default function ClusterPage() {
  const { classes } = useStyles();
  const router = useRouter();
  const { id } = router.query;
  const theme = useMantineTheme();
  const { address } = useConnect();
  const clipboard = useClipboard({ timeout: 500 });
  const smallerThenXS = useMediaQuery(`(max-width: ${theme.breakpoints.xs})`);

  const { data: cluster } = trpc.cluster.get.useQuery({ id } as { id: string });
  const { data: spores } = trpc.spore.list.useQuery({ clusterId: id } as {
    clusterId: string;
  });

  const mintSporeModal = useMintSporeModal(id as string);
  const transferClusterModal = useTransferClusterModal(cluster);

  const owner = useMemo(() => {
    if (!cluster) return '';
    const address = helpers.encodeToAddress(cluster.cell.cellOutput.lock);
    return address;
  }, [cluster]);

  const isPublic = useMemo(() => {
    if (!cluster) {
      return false;
    }
    return isAnyoneCanPay(cluster?.cell.cellOutput.lock);
  }, [cluster]);

  const isSporesLoading = !spores;
  const isLoading = !cluster;

  const header = isLoading ? (
    <Flex align="center" className={classes.header}>
      <Container w="100%" size="xl">
        <Grid>
          <Grid.Col span={smallerThenXS ? 12 : 8}>
            <Flex direction="column">
              <Flex align="center" mb="8px">
                <Box mr="8px">
                  <Image
                    src="/svg/cluster-icon.svg"
                    alt="Cluster Icon"
                    width="24"
                    height="24"
                  />
                </Box>
                <Text size="xl" weight="bold" color="text.1">
                  Cluster
                </Text>
              </Flex>
              <Flex mb="24px">
                <Skeleton
                  baseColor={theme.colors.background[0]}
                  height="32px"
                  width="300px"
                  borderRadius="16px"
                />
              </Flex>
              <Skeleton
                baseColor={theme.colors.background[0]}
                height="20px"
                width="500px"
                borderRadius="16px"
              />
            </Flex>
          </Grid.Col>
          <Grid.Col span={smallerThenXS ? 12 : 4}>
            <Flex direction="column">
              <Title mb="8px" order={5}>
                Owned by
              </Title>
              <Flex mb="24px">
                <Skeleton
                  baseColor={theme.colors.background[0]}
                  height="20px"
                  width="200px"
                  borderRadius="16px"
                />
              </Flex>
            </Flex>
          </Grid.Col>
        </Grid>
      </Container>
    </Flex>
  ) : (
    <Flex align="center" className={classes.header}>
      <Container w="100%" size="xl">
        <Grid>
          <Grid.Col span={smallerThenXS ? 12 : 8}>
            <Flex direction="column">
              <Flex align="center" mb="8px">
                <Box mr="8px">
                  <Image
                    src="/svg/cluster-icon.svg"
                    alt="Cluster Icon"
                    width="24"
                    height="24"
                  />
                </Box>
                <Text size="xl" weight="bold" color="text.1">
                  Cluster
                </Text>
              </Flex>
              <Flex mb="24px">
                <Flex
                  direction={{ base: 'column', xs: 'row' }}
                  gap={{ base: '8px', sx: '0px' }}
                >
                  <Title order={2} mr="md" className={classes.name}>
                    {cluster?.name}
                  </Title>
                  <Tooltip
                    label={
                      isPublic
                        ? 'Anyone can mint Spores into this public Cluster'
                        : 'Only the owner can mint Spores into this private Cluster'
                    }
                    withArrow
                  >
                    <Box>
                      <Flex
                        w="100px"
                        justify="center"
                        align="center"
                        h="40px"
                        bg="white"
                        px="md"
                        sx={{ borderRadius: '20px' }}
                      >
                        <Title
                          order={5}
                          color="text.0"
                          style={{ cursor: 'default' }}
                        >
                          {isPublic ? 'Public' : 'Private'}
                        </Title>
                      </Flex>
                    </Box>
                  </Tooltip>
                </Flex>
              </Flex>
              <Text size="20px" color="text.1" className={classes.description}>
                {cluster?.description}
              </Text>
            </Flex>
          </Grid.Col>
          <Grid.Col span={smallerThenXS ? 12 : 4}>
            <Flex direction="column">
              <Title mb="8px" order={5}>
                Owned by
              </Title>
              <Flex mb="24px">
                <Flex align="center">
                  {address === owner ? (
                    <>
                      <Text size="lg">Me (</Text>
                      <Link href={`/my`} style={{ textDecoration: 'none' }}>
                        <Text size="lg" color="brand.1">
                          {owner.slice(0, 10)}...{owner.slice(-10)}
                        </Text>
                      </Link>
                      <Text size="lg">)</Text>
                    </>
                  ) : (
                    <Link href={`/${owner}`} style={{ textDecoration: 'none' }}>
                      <Text size="lg" color="brand.1">
                        {owner.slice(0, 10)}...{owner.slice(-10)}
                      </Text>
                    </Link>
                  )}
                  <Flex
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      clipboard.copy(owner);
                      showSuccess('Copied!');
                    }}
                    ml="3px"
                  >
                    <IconCopy size="22px" color={theme.colors.text[0]} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex direction={{ base: 'column', xs: 'row' }} gap="md">
                {(isPublic || owner === address) && (
                  <Button
                    className={classes.button}
                    onClick={mintSporeModal.open}
                  >
                    Mint Spore
                  </Button>
                )}
                {owner === address && (
                  <Button
                    className={classes.button}
                    onClick={transferClusterModal.open}
                  >
                    Transfer Cluster
                  </Button>
                )}
              </Flex>
            </Flex>
          </Grid.Col>
        </Grid>
      </Container>
    </Flex>
  );

  return (
    <Layout header={header}>
      <Head>
        <title>Cluster: {id} - Spore Demo</title>
      </Head>
      <ClusterOpenGraph id={id as string} />
      <Container py="48px" size="xl">
        <SporeGrid
          title={isSporesLoading ? '' : `${spores.length} Spores`}
          spores={spores ?? []}
          cluster={cluster}
          isLoading={isSporesLoading}
        />
      </Container>
    </Layout>
  );
}
