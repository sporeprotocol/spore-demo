import ClusterGrid from '@/components/ClusterGrid';
import Layout from '@/components/Layout';
import SporeGrid from '@/components/SporeGrid';
import { useConnect } from '@/hooks/useConnect';
import { trpc } from '@/server';
import { showSuccess } from '@/utils/notifications';
import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  Container,
  Flex,
  MediaQuery,
  createStyles,
  Box,
  useMantineTheme,
  Button,
  Group,
  Image,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCopy } from '@tabler/icons-react';
import Head from 'next/head';
import { useMemo, useState } from 'react';

const useStyles = createStyles((theme) => ({
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
    right: '-460px',
    top: '-30px',
  },

  buttonGroup: {
    backgroundColor: theme.colors.background[1],
    borderRadius: '18px',
  },

  button: {
    height: '40px !important',
    backgroundColor: theme.colors.background[1],
    fontSize: '16px !important',
    padding: '5px 40px !important',
    color: theme.colors.text[0],
    borderRadius: '0px !important',

    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.colors.brand[1], 0.8),
    },

    '&:first-of-type': {
      borderTopLeftRadius: '20px !important',
      borderBottomLeftRadius: '20px !important',
    },

    '&:last-of-type': {
      borderTopRightRadius: '20px !important',
      borderBottomRightRadius: '20px !important',
    },
  },

  active: {
    color: theme.white,
    backgroundColor: theme.colors.brand[1],

    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.colors.brand[1], 0.1),
    },
  },
}));

export default function MySpacePage() {
  const { classes, cx } = useStyles();
  const theme = useMantineTheme();
  const clipboard = useClipboard({ timeout: 500 });
  const { address } = useConnect();
  const [showSpores, setShowSpores] = useState(true);
  const { data: capacity = '0' } = trpc.accout.balance.useQuery({ address });

  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery({ owner: address });
  const { data: clusters = [] } = trpc.cluster.list.useQuery({
    withPublic: true,
  });
  const { data: ownedClusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery({
      owner: address,
      withPublic: true,
    });

  const isLoading = isSporesLoading || isClusterLoading;

  const balance = useMemo(() => {
    if (!capacity) return 0;
    return Math.floor(BI.from(capacity).toNumber() / 10 ** 8);
  }, [capacity]);

  const header = (
    <Flex align="center" className={classes.banner}>
      <Container size="xl" className={classes.container}>
        <MediaQuery query="(max-width: 80rem)" styles={{ display: 'none' }}>
          <Image
            className={classes.illus}
            src="/svg/my-space-illus.svg"
            width="251"
            height="263"
            alt="My Space Illus"
          />
        </MediaQuery>
        <Flex direction="column" justify="center" align="center" gap="32px">
          <MediaQuery smallerThan="xs" styles={{ display: 'none' }}>
            <Box px="68px">
              <Image
                src="/images/my-space-title.png"
                width="495"
                height="60"
                alt="My Space"
              />
            </Box>
          </MediaQuery>
          <MediaQuery largerThan="xs" styles={{ display: 'none' }}>
            <Image
              src="/images/my-space-title.png"
              width="324"
              height="40"
              alt="My Space"
            />
          </MediaQuery>
          <Flex
            direction={{ base: 'column', xs: 'row' }}
            gap={{ base: 'md', xs: 'none' }}
            w="100%"
            align="center"
            justify="space-around"
          >
            <Flex align="center">
              <Text
                component="span"
                size="xl"
                align="center"
                color="text.0"
                mr="sm"
              >
                Address:
              </Text>
              <Text
                component="span"
                size="xl"
                weight="bold"
                color="text.0"
                mr="5px"
              >
                {address.slice(0, 10)}...{address.slice(-10)}
              </Text>
              <Text
                component="span"
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  clipboard.copy(address);
                  showSuccess('Copied!');
                }}
                h="22px"
                ml="3px"
              >
                <IconCopy size="22px" color={theme.colors.text[0]} />
              </Text>
            </Flex>
            <Flex align="center">
              <Text size="xl" align="center" color="text.0" mr="sm">
                Balance:
              </Text>
              <Text size="xl" weight="bold" color="text.0" mr="5px">
                {balance} CKB
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </Flex>
  );

  return (
    <Layout header={header}>
      <Head>
        <title>My Spore - Spore Demo</title>
      </Head>
      <Container size="xl" py="48px">
        <Flex justify="center" mb="48px">
          <Group spacing={0} className={classes.buttonGroup}>
            <Button
              className={cx(classes.button, { [classes.active]: showSpores })}
              onClick={() => setShowSpores(true)}
            >
              Spores
            </Button>
            <Button
              className={cx(classes.button, { [classes.active]: !showSpores })}
              onClick={() => setShowSpores(false)}
            >
              Clusters
            </Button>
          </Group>
        </Flex>
        {showSpores ? (
          <SporeGrid
            title={isSporesLoading ? '' : `${spores.length} Spores`}
            spores={spores}
            cluster={(id) => clusters.find((c) => c.id === id)}
            isLoading={isSporesLoading}
          />
        ) : (
          <ClusterGrid
            title={isLoading ? '' : `${ownedClusters.length} Clusters`}
            clusters={ownedClusters}
            spores={spores}
            isLoading={isLoading}
          />
        )}
      </Container>
    </Layout>
  );
}
