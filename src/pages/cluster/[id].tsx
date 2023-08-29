import EmptyPlaceholder from '@/components/EmptyPlaceholder';
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
  Group,
  Button,
  useMantineTheme,
  Box,
  Tooltip,
  Title,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCopy } from '@tabler/icons-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const useStyles = createStyles((theme) => ({
  header: {
    height: '280px',
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },
  name: {
    textOverflow: 'ellipsis',
    maxWidth: '574px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
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

  const { data: cluster } = trpc.cluster.get.useQuery({ id } as { id: string });
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery({ clusterId: id } as { clusterId: string });

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

  const isLoading = !cluster;

  return (
    <Layout>
      <Head>
        <title>Cluster: {id} - Spore Demo</title>
      </Head>
      <Flex align="center" className={classes.header}>
        <Container w="100%" size="xl" mt="80px">
          <Grid>
            <Grid.Col span={8}>
              <Flex direction="column">
                <Flex align="center">
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
                  {isLoading ? (
                    <Skeleton
                      baseColor={theme.colors.background[0]}
                      height="32px"
                      width="300px"
                      borderRadius="16px"
                    />
                  ) : (
                    <Flex>
                      <Title order={2} mr="md" className={classes.name}>
                        {cluster?.name}
                      </Title>
                      {isPublic ? (
                        <Tooltip
                          label="Anyone can mint Spores into this public Cluster"
                          withArrow
                        >
                          <Flex
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
                              Public
                            </Title>
                          </Flex>
                        </Tooltip>
                      ) : (
                        <Tooltip
                          label="Only the owner can mint Spores into this private Cluster"
                          withArrow
                        >
                          <Flex
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
                              Private
                            </Title>
                          </Flex>
                        </Tooltip>
                      )}
                    </Flex>
                  )}
                </Flex>
                {isLoading ? (
                  <Skeleton
                    baseColor={theme.colors.background[0]}
                    height="20px"
                    width="500px"
                    borderRadius="16px"
                  />
                ) : (
                  <Text
                    size="20px"
                    color="text.1"
                    className={classes.description}
                  >
                    {cluster?.description}
                  </Text>
                )}
              </Flex>
            </Grid.Col>
            <Grid.Col span={4}>
              <Flex direction="column">
                <Text mb="8px" size="lg" weight="bold">
                  Owned by
                </Text>
                <Flex mb="24px">
                  {isLoading ? (
                    <Skeleton
                      baseColor={theme.colors.background[0]}
                      height="20px"
                      width="200px"
                      borderRadius="16px"
                    />
                  ) : (
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
                        <Link
                          href={`/${owner}`}
                          style={{ textDecoration: 'none' }}
                        >
                          <Text size="lg" color="brand.1">
                            {owner.slice(0, 10)}...{owner.slice(-10)}
                          </Text>
                        </Link>
                      )}
                      <Tooltip
                        label={clipboard.copied ? 'Copied!' : 'Copy'}
                        withArrow
                      >
                        <Flex
                          sx={{ cursor: 'pointer' }}
                          onClick={() => clipboard.copy(address)}
                          ml="3px"
                        >
                          <IconCopy size="22px" color={theme.colors.text[0]} />
                        </Flex>
                      </Tooltip>
                    </Flex>
                  )}
                </Flex>
                <Group>
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
                </Group>
              </Flex>
            </Grid.Col>
          </Grid>
        </Container>
      </Flex>
      <Container py="48px" size="xl">
        <SporeGrid
          title={isSporesLoading ? '' : `${spores.length} Spores`}
          spores={spores}
          cluster={cluster}
          isLoading={isSporesLoading}
        />
      </Container>
    </Layout>
  );
}
