import 'react-loading-skeleton/dist/skeleton.css';
import Layout from '@/components/Layout';
import SporeGrid from '@/components/SporeGrid';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import useTransferClusterModal from '@/hooks/modal/useTransferClusterModal';
import { useConnect } from '@/hooks/useConnect';
import { isAnyoneCanPay } from '@/utils/script';
import { config, helpers } from '@ckb-lumos/lumos';
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
import { IconCopy, IconDots } from '@tabler/icons-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { ClusterOpenGraph } from '@/components/OpenGraph';
import { showSuccess } from '@/utils/notifications';
import DropMenu from '@/components/DropMenu';
import useSponsorClusterModal from '@/hooks/modal/useSponsorClusterModal';
import { useClusterQuery } from '@/hooks/query/useClusterQuery';
import { useClusterSporesQuery } from '@/hooks/query/useClusterSporesQuery';

export const useStyles = createStyles((theme) => ({
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
    maxWidth: '953px ',
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

    [theme.fn.smallerThan('sm')]: {
      flexGrow: 1,
    },

    '&:hover': {
      backgroundColor: theme.colors.text[0],
      color: theme.white,
    },
  },
  more: {
    color: theme.colors.text[0],
    backgroundColor: theme.colors.brand[0],
    borderWidth: '2px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: 'none !important',
    minWidth: '48px !important',
    width: '48px',
    padding: '0px !important',

    '&:hover': {
      backgroundColor: theme.colors.text[0],
      color: theme.white,
      fill: theme.white,
    },
  },
}));

export default function ClusterPage() {
  const { classes } = useStyles();
  const router = useRouter();
  const { id } = router.query;
  const theme = useMantineTheme();
  const { address, getAnyoneCanPayLock, connected } = useConnect();
  const clipboard = useClipboard({ timeout: 500 });
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { data: cluster, isLoading } = useClusterQuery(id as string);
  const { data: spores, isLoading: isSporesLoading } = useClusterSporesQuery(cluster?.id);

  const mintSporeModal = useMintSporeModal(id as string);
  const transferClusterModal = useTransferClusterModal(cluster);
  const sponsorClusterModal = useSponsorClusterModal(cluster);

  const owner = useMemo(() => {
    if (!cluster || !cluster.cell) {
      return '';
    }
    const address = helpers.encodeToAddress(cluster.cell.cellOutput.lock, {
      config: config.predefined.AGGRON4,
    });
    return address;
  }, [cluster]);

  const isPublic = useMemo(() => {
    if (!cluster || !cluster.cell) {
      return false;
    }
    return isAnyoneCanPay(cluster.cell.cellOutput.lock);
  }, [cluster]);

  const isOwned = useMemo(() => {
    if (!connected) {
      return false;
    }
    if (owner === address) {
      return true;
    }
    const acpAddress = helpers.encodeToAddress(getAnyoneCanPayLock(), {
      config: config.predefined.AGGRON4,
    });
    if (acpAddress === owner) {
      return true;
    }
  }, [address, owner, getAnyoneCanPayLock, connected]);

  const header = isLoading ? (
    <Flex align="center" className={classes.header}>
      <Container w="100%" size="xl">
        <Grid>
          <Grid.Col span={isMobile ? 12 : 8}>
            <Flex direction="column">
              <Flex align="center" mb="8px">
                <Box mr="8px">
                  <Image src="/svg/cluster-icon.svg" alt="Cluster Icon" width="24" height="24" />
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
            <Flex direction="column" mt="24px">
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
          <Grid.Col span={isMobile ? 12 : 8}>
            <Flex direction="column">
              <Flex align="center" mb="8px">
                <Box mr="8px">
                  <Image src="/svg/cluster-icon.svg" alt="Cluster Icon" width="24" height="24" />
                </Box>
                <Text size="xl" weight="bold" color="text.1">
                  Cluster
                </Text>
              </Flex>
              <Flex mb="24px">
                <Flex direction={{ base: 'column', sm: 'row' }} gap={{ base: '8px', sx: '0px' }}>
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
                        <Title order={5} color="text.0" style={{ cursor: 'default' }}>
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
              <Flex direction="column" mt="24px">
                <Title mb="8px" order={5}>
                  Owned by
                </Title>
                <Flex mb="24px">
                  <Flex align="center">
                    <Text component="span">
                      {isOwned ? (
                        <>
                          <Text size="lg" component="span">
                            Me (
                          </Text>
                          <Link href={`/my`} style={{ textDecoration: 'none' }}>
                            <Text size="lg" color="brand.1" component="span">
                              {owner.slice(0, 10)}...{owner.slice(-10)}
                            </Text>
                          </Link>
                          <Text size="lg" component="span">
                            )
                          </Text>
                        </>
                      ) : (
                        <Link href={`/${owner}`} style={{ textDecoration: 'none' }}>
                          <Text size="lg" color="brand.1">
                            {owner.slice(0, 10)}...{owner.slice(-10)}
                          </Text>
                        </Link>
                      )}
                    </Text>
                    <Text
                      component="span"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => {
                        clipboard.copy(owner);
                        showSuccess('Copied!');
                      }}
                      h="22px"
                      ml="5px"
                    >
                      <Tooltip label={clipboard.copied ? 'Copied' : 'Copy'} withArrow>
                        <IconCopy size="22px" color={theme.colors.text[0]} />
                      </Tooltip>
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Grid.Col>
          <Grid.Col span={isMobile ? 12 : 4}>
            <Flex direction="column">
              <Flex direction="row" justify="end" gap="md">
                {(isPublic || isOwned) && (
                  <Button className={classes.button} onClick={mintSporeModal.open}>
                    Mint Spore
                  </Button>
                )}
                {isOwned && (
                  <DropMenu
                    position="bottom-end"
                    menu={[
                      {
                        type: 'item',
                        key: 'sponsor-spore',
                        title: (
                          <Flex align="center">
                            <Image
                              src="/svg/icon-add-capacity.svg"
                              width="18"
                              height="18"
                              alt="sponsor"
                            />
                            <Text ml="8px">Sponsor</Text>
                          </Flex>
                        ),
                        onClick: () => {
                          sponsorClusterModal.open();
                        },
                      },
                      {
                        type: 'item',
                        key: 'transfer-spore',
                        title: (
                          <Flex align="center">
                            <Image
                              src="/svg/icon-repeat.svg"
                              width="18"
                              height="18"
                              alt="transfer"
                            />
                            <Text ml="8px">Transfer</Text>
                          </Flex>
                        ),
                        onClick: () => {
                          transferClusterModal.open();
                        },
                      },
                    ]}
                  >
                    <Button className={classes.more}>
                      <IconDots size="24" />
                    </Button>
                  </DropMenu>
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
          title={isSporesLoading ? '' : `${spores.length ?? '0'} Spores`}
          spores={spores.map((spore) => ({ ...spore, clusterId: cluster?.id, cluster }))}
          isLoading={isSporesLoading}
        />
      </Container>
    </Layout>
  );
}
