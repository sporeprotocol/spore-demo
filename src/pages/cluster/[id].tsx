import Layout from '@/components/Layout';
import {
  Title,
  Text,
  Flex,
  Button,
  Box,
  SimpleGrid,
  Alert,
  Group,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import { helpers } from '@ckb-lumos/lumos';
import superjson from 'superjson';
import SporeCard from '@/components/SporeCard';
import Link from 'next/link';
import useAddSporeModal from '@/hooks/modal/useAddSporeModal';
import useTransferClusterModal from '@/hooks/modal/useTransferClusterModal';
import { useConnect } from '@/hooks/useConnect';
import ClusterService, { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@/server/routers';
import { trpc } from '@/server';

export type ClusterPageProps = {
  cluster: Cluster | undefined;
  spores: Spore[];
};

export type ClusterPageParams = {
  id: string;
};

export const getStaticPaths: GetStaticPaths<ClusterPageParams> = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  const clusters = await ClusterService.shared.list();
  const paths = clusters.map(({ id }) => ({
    params: { id },
  }));
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps = async (
  context: GetStaticPropsContext<ClusterPageParams>,
) => {
  const { id } = context.params!;
  const trpcHelpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: superjson,
  });

  await Promise.all([
    trpcHelpers.cluster.get.prefetch({ id }),
    trpcHelpers.spore.list.prefetch({ clusterId: id }),
  ]);

  return {
    props: {
      trpcState: trpcHelpers.dehydrate(),
    },
  };
};

export default function ClusterPage() {
  const router = useRouter();
  const { id } = router.query;
  const { connected, isOwned } = useConnect();
  const { data: cluster } = trpc.cluster.get.useQuery({ id: id as string });
  const { data: spores = [] } = trpc.spore.list.useQuery({
    clusterId: id as string,
  });

  const addSporeModal = useAddSporeModal(id as string);
  const transferClusterModal = useTransferClusterModal(cluster);

  const ownerAddress = useMemo(() => {
    if (cluster) {
      return helpers.encodeToAddress(cluster.cell.cellOutput.lock);
    }
    return '';
  }, [cluster]);

  const isOwnedCluster = useMemo(() => {
    if (cluster && connected) {
      return isOwned(cluster.cell.cellOutput.lock);
    }
    return false;
  }, [cluster, isOwned, connected]);

  if (!cluster) {
    return null;
  }

  return (
    <Layout>
      <Flex direction="row" justify="space-between" align="end">
        <Flex direction="column">
          <Title order={1}>{cluster.name}</Title>
          <Text>{cluster.description}</Text>
          <Link
            href={`/${ownerAddress}`}
            style={{ textDecoration: 'none' }}
          >
            <Text size="sm" color="gray">
              by {`${ownerAddress?.slice(0, 20)}...${ownerAddress?.slice(-20)}`}
            </Text>
          </Link>
        </Flex>
        <Group>
          {isOwnedCluster && (
            <Button
              disabled={!connected}
              onClick={transferClusterModal.open}
              loading={transferClusterModal.loading}
            >
              Transter
            </Button>
          )}
          {isOwnedCluster && (
            <Button
              disabled={!connected}
              onClick={addSporeModal.open}
              loading={addSporeModal.loading}
            >
              Mint
            </Button>
          )}
        </Group>
      </Flex>

      {!isOwned && (
        <Alert mt="md" icon={<IconAlertCircle size="1rem" />}>
          This cluster does not belong to you, so you cannot mint a spore.
        </Alert>
      )}

      <Box mt={20}>
        <SimpleGrid cols={4}>
          {spores.map((spore) => {
            return <SporeCard key={spore.id} spore={spore} cluster={cluster} />;
          })}
        </SimpleGrid>
      </Box>
    </Layout>
  );
}
