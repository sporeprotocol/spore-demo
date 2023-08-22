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
} from '@mantine/core';
import { useRouter } from 'next/router';
import { trpc } from '@/server';
import Link from 'next/link';
import { BI, config, helpers } from '@ckb-lumos/lumos';
import { IconCopy } from '@tabler/icons-react';
import { useConnect } from '@/hooks/useConnect';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const useStyles = createStyles((theme) => ({
  image: {
    borderRadius: '8px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '4px 4px 0 #111318',
    backgroundColor: theme.colors.background[1],
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
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();

  const { address } = useConnect();
  const { data: spore } = trpc.spore.get.useQuery({ id: id as string });
  const { data: cluster } = trpc.cluster.get.useQuery(
    { id: spore?.clusterId ?? undefined },
    { enabled: !!spore?.clusterId },
  );

  const amount = spore
    ? BI.from(spore.cell.cellOutput.capacity).toNumber() / 10 ** 8
    : 0;
  const owner = spore
    ? helpers.encodeToAddress(spore.cell.cellOutput.lock, {
        config: config.predefined.AGGRON4,
      })
    : '';

  const isLoading = !spore;

  return (
    <Layout>
      <Container size="xl" py="48px" mt="80px">
        {cluster && (
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
        )}
        <Grid>
          <Grid.Col span={6}>
            <AspectRatio ratio={1} w="486px" h="486px">
              {isLoading ? (
                <Skeleton
                  width="100%"
                  height="100%"
                  className={classes.image}
                  baseColor={theme.colors.background[1]}
                />
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
                    <IconCopy size="30px" />
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
                    <Link href={`/${owner}`} style={{ textDecoration: 'none' }}>
                      <Text size="xl" color="brand.1" mr="3px">
                        {owner.slice(0, 10)}...{owner.slice(-10)}
                      </Text>
                    </Link>
                    <IconCopy size="22px" />
                  </Flex>
                )}
              </Flex>
              {owner === address && (
                <Group mt="64px">
                  <Button className={cx(classes.button, classes.transfer)}>
                    Transfer
                  </Button>
                  <Button className={cx(classes.button, classes.destory)}>
                    Destory
                  </Button>
                </Group>
              )}
            </Flex>
          </Grid.Col>
        </Grid>
      </Container>
    </Layout>
  );
}
