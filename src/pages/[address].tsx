import ClusterGrid from '@/components/ClusterGrid';
import Layout from '@/components/Layout';
import SporeGrid from '@/components/SporeGrid';
import { trpc } from '@/server';
import { showSuccess } from '@/utils/notifications';
import {
  Text,
  Container,
  Flex,
  MediaQuery,
  createStyles,
  useMantineTheme,
  Button,
  Group,
  Title,
  Tooltip,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { IconCopy } from '@tabler/icons-react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const useStyles = createStyles((theme) => ({
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

export default function AccountPage() {
  const { classes, cx } = useStyles();
  const router = useRouter();
  const { address } = router.query;
  const theme = useMantineTheme();
  const [showSpores, setShowSpores] = useState(true);
  const clipboard = useClipboard({ timeout: 500 });

  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery({ owner: address as string });
  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery({
      owner: address as string,
      withPublic: true,
    });

  const isLoading = isSporesLoading || isClusterLoading;

  if (!address) {
    return null;
  }

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
          <Flex>
            <Title order={2}>
              {address.slice(0, 8)}...{address.slice(-8)}
              {"'s Space"}
            </Title>
          </Flex>
          <Flex px="24px" w="100%" justify="center" align="center">
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
              <Link
                href={`https://pudge.explorer.nervos.org/address/${address}`}
                target="_blank"
                style={{ textDecoration: 'none' }}
              >
                <Text
                  component="span"
                  size="xl"
                  weight="bold"
                  color="text.0"
                  mr="5px"
                >
                  {address.slice(0, 8)}...{address.slice(-8)}
                </Text>
              </Link>
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
                <Tooltip label={clipboard.copied ? 'Copied' : 'Copy'} withArrow>
                  <IconCopy size="22px" color={theme.colors.text[0]} />
                </Tooltip>
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
        <title>
          {address.slice(0, 8)}...{address.slice(-8)}
          {"'s Space"}
        </title>
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
            title={isLoading ? '' : `${clusters.length} Clusters`}
            clusters={clusters}
            spores={spores}
            isLoading={isLoading}
          />
        )}
      </Container>
    </Layout>
  );
}
