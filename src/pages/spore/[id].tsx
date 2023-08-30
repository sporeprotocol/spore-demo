import Layout from '@/components/Layout';
import {
  Text,
  Image,
  Flex,
  Container,
  Grid,
  AspectRatio,
  createStyles,
  Title,
  Button,
  Group,
  useMantineTheme,
  Box,
  Tooltip,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { trpc } from '@/server';
import Link from 'next/link';
import { BI, config, helpers } from '@ckb-lumos/lumos';
import { IconCopy } from '@tabler/icons-react';
import { useConnect } from '@/hooks/useConnect';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import useTransferSporeModal from '@/hooks/modal/useTransferSporeModal';
import useDestroySporeModal from '@/hooks/modal/useDestroySporeModal';
import { useMemo } from 'react';
import Head from 'next/head';
import { useClipboard } from '@mantine/hooks';

const useStyles = createStyles((theme, params?: { pixelated: boolean }) => ({
  image: {
    borderRadius: '8px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '4px 4px 0 #111318',
    backgroundColor: theme.colors.background[1],
    imageRendering: params?.pixelated ? 'pixelated' : 'auto',
  },
  button: {
    boxShadow: 'none !important',
    backgroundColor: theme.colors.background[0],
    borderWidth: '2px',
    borderStyle: 'solid',
  },
  transfer: {
    borderColor: theme.colors.text[0],
    color: theme.colors.text[0],

    '&:hover': {
      backgroundColor: theme.colors.text[0],
      color: theme.white,
    },
  },
  destory: {
    borderColor: theme.colors.functional[0],
    color: theme.colors.functional[0],

    '&:hover': {
      backgroundColor: theme.colors.functional[0],
      color: theme.white,
    },
  },
}));

export default function SporePage() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useMantineTheme();
  const { address } = useConnect();
  const clipboard = useClipboard({ timeout: 500 });

  const { data: spore } = trpc.spore.get.useQuery({ id: id as string });
  const capacity = useMemo(() => BI.from(spore?.cell.cellOutput.capacity ?? 0).toNumber(), [spore]);
  const { classes, cx } = useStyles({ pixelated: capacity < 10_000 * (10 ** 8) });

  const { data: cluster } = trpc.cluster.get.useQuery(
    { id: spore?.clusterId ?? undefined },
    { enabled: !!spore?.clusterId },
  );
  const { data: spores = [] } = trpc.spore.list.useQuery(
    { clusterId: spore?.clusterId ?? undefined },
    { enabled: !!spore?.clusterId },
  );

  const transferSpore = useTransferSporeModal(spore);
  const destorySpore = useDestroySporeModal(spore);

  const amount = spore
    ? Math.ceil(BI.from(spore.cell.cellOutput.capacity).toNumber() / 10 ** 8)
    : 0;
  const owner = spore
    ? helpers.encodeToAddress(spore.cell.cellOutput.lock, {
        config: config.predefined.AGGRON4,
      })
    : '';

  const nextSporeIndex = useMemo(
    () => spores.findIndex((sp) => sp.id === id) + 1,
    [spores, id],
  );
  const prevSporeIndex = useMemo(
    () => spores.findIndex((sp) => sp.id === id) - 1,
    [spores, id],
  );

  const isLoading = !spore;

  return (
    <Layout>
      <Head>
        <title>Spore: {id} - Spore Demo</title>
      </Head>
      <Container size="xl" py="48px" mt="80px">
        {cluster ? (
          <Link
            href={`/cluster/${cluster.id}`}
            style={{ textDecoration: 'none' }}
          >
            <Flex mb="32px">
              <Image
                src="/svg/cluster-icon.svg"
                alt="Cluster Icon"
                width="24px"
                height="24px"
                mr="8px"
              />
              <Text size="lg" color="text.0" weight="bold">
                {cluster.name}
              </Text>
            </Flex>
          </Link>
        ) : (
          <Box mb="32px" h="28px" />
        )}
        <Grid>
          <Grid.Col span={6}>
            <AspectRatio ratio={1} w="486px" h="486px">
              {isLoading ? (
                <Box className={classes.image}>
                  <Skeleton
                    width="100%"
                    height="100%"
                    className={classes.image}
                    baseColor={theme.colors.background[1]}
                  />
                </Box>
              ) : (
                <Image
                  alt={spore!.id}
                  width="486px"
                  height="486px"
                  src={`/api/v1/media/${spore!.id}`}
                  fit="contain"
                  className={classes.image}
                />
              )}
            </AspectRatio>
          </Grid.Col>
          <Grid.Col span={6}>
            <Flex h="100%" direction="column" justify="center">
              <Flex align="center" mb="32px">
                {isLoading ? (
                  <Skeleton
                    baseColor={theme.colors.background[1]}
                    height="32px"
                    width="400px"
                    borderRadius="16px"
                  />
                ) : (
                  <>
                    <Title order={2} mr="3px">
                      {spore!.id.slice(0, 10)}...{spore!.id.slice(-10)}
                    </Title>
                    <Tooltip
                      label={clipboard.copied ? 'Copied!' : 'Copy'}
                      withArrow
                    >
                      <Flex
                        sx={{ cursor: 'pointer' }}
                        onClick={() => clipboard.copy(spore!.id)}
                        ml="3px"
                      >
                        <IconCopy size="30px" color={theme.colors.text[0]} />
                      </Flex>
                    </Tooltip>
                  </>
                )}
              </Flex>
              <Flex mb="64px">
                {isLoading ? (
                  <Skeleton
                    baseColor={theme.colors.background[1]}
                    height="32px"
                    width="200px"
                    borderRadius="16px"
                  />
                ) : (
                  <Title
                    order={2}
                    bg="brand.0"
                    px="8px"
                    style={{ display: 'inline' }}
                  >
                    {amount} CKB
                  </Title>
                )}
              </Flex>
              <Flex direction="column">
                <Text size="lg" color="text.0" weight="bold">
                  Owned by
                </Text>
                {isLoading ? (
                  <Skeleton
                    baseColor={theme.colors.background[1]}
                    height="22px"
                    width="300px"
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
              {owner === address && (
                <Group mt="64px">
                  <Button
                    className={cx(classes.button, classes.transfer)}
                    onClick={transferSpore.open}
                  >
                    Transfer
                  </Button>
                  <Button
                    className={cx(classes.button, classes.destory)}
                    onClick={destorySpore.open}
                  >
                    Destory
                  </Button>
                </Group>
              )}
            </Flex>
          </Grid.Col>
        </Grid>
        {cluster && spores.length > 1 && (
          <Flex justify="space-between" mt="80px">
            {prevSporeIndex >= 0 ? (
              <Link
                href={`/spore/${spores[prevSporeIndex].id}`}
                style={{ textDecoration: 'none' }}
                prefetch
              >
                <Image
                  src="/svg/icon-chevron-left.svg"
                  width="32"
                  height="32"
                  alt="Previus Spore"
                />
              </Link>
            ) : (
              <Box h="32px" w="32px" />
            )}
            <Text size="xl" color="text.0">
              {nextSporeIndex} / {spores.length}
            </Text>
            {nextSporeIndex < spores.length ? (
              <Link
                href={`/spore/${spores[nextSporeIndex].id}`}
                style={{ textDecoration: 'none' }}
                prefetch
              >
                <Image
                  src="/svg/icon-chevron-right.svg"
                  width="32"
                  height="32"
                  alt="Previus Spore"
                />
              </Link>
            ) : (
              <Box h="32px" w="32px" />
            )}
          </Flex>
        )}
      </Container>
    </Layout>
  );
}
