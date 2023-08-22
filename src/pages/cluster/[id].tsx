import Layout from '@/components/Layout';
import SporeCard, { SporeSkeletonCard } from '@/components/SporeCard';
import SporeGrid from '@/components/SporeGrid';
import useAddSporeModal from '@/hooks/modal/useAddSporeModal';
import useTransferClusterModal from '@/hooks/modal/useTransferClusterModal';
import { trpc } from '@/server';
import { config, helpers } from '@ckb-lumos/lumos';
import {
  Text,
  Flex,
  createStyles,
  Container,
  Grid,
  Image,
  Group,
  Button,
  Box,
  Title,
  SimpleGrid,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

const useStyles = createStyles((theme) => ({
  header: {
    height: '280px',
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },
  button: {
    color: theme.colors.text[0],
    backgroundColor: theme.colors.brand[0],
    borderWidth: '2px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: 'none !important',

    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.colors.brand[0], 0.3),
    },
  },
}));

export default function ClusterPage() {
  const { classes } = useStyles();
  const router = useRouter();
  const { id } = router.query;
  const { data: cluster } = trpc.cluster.get.useQuery({ id } as { id: string });
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery({ clusterId: id } as { clusterId: string });

  const addSporeModal = useAddSporeModal();
  const transferClusterModal = useTransferClusterModal();

  const owner = useMemo(() => {
    if (!cluster) return '';
    const address = helpers.encodeToAddress(cluster.cell.cellOutput.lock);
    return address;
  }, [cluster]);

  return (
    <Layout>
      <Flex align="center" className={classes.header}>
        <Container w="100%" size="xl" mt="80px">
          <Grid>
            <Grid.Col span={8}>
              <Flex direction="column">
                <Flex align="center">
                  <Image
                    src="/svg/cluster-icon.svg"
                    alt="Cluster Icon"
                    width="24px"
                    height="24px"
                    mr="8px"
                  />
                  <Text size="xl" weight="bold" color="text.1">
                    Cluster
                  </Text>
                </Flex>
                <Flex mb="24px">
                  <Text size="32px" weight="bold">
                    {cluster?.name}
                  </Text>
                </Flex>
                <Text size="20px" color="text.1">
                  {cluster?.description}
                </Text>
              </Flex>
            </Grid.Col>
            <Grid.Col span={4}>
              <Flex direction="column">
                <Text mb="8px" size="lg" weight="bold">
                  Owned by
                </Text>
                <Flex mb="24px">
                  <Text size="lg" color="brand.1">
                    {owner.slice(0, 10)}...{owner.slice(-10)}
                  </Text>
                </Flex>
                <Group>
                  <Button
                    className={classes.button}
                    onClick={addSporeModal.open}
                  >
                    Mint Spore
                  </Button>
                  <Button
                    className={classes.button}
                    onClick={transferClusterModal.open}
                  >
                    Transfer Cluster
                  </Button>
                </Group>
              </Flex>
            </Grid.Col>
          </Grid>
        </Container>
      </Flex>
      <Container py="48px" size="xl">
        <SporeGrid
          title={`${spores.length} Spores`}
          spores={spores}
          cluster={cluster}
          isLoading={isSporesLoading}
        />
      </Container>
    </Layout>
  );
}
