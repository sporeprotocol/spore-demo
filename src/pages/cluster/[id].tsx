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
import { GetStaticPaths, GetStaticProps } from 'next';
import { config, helpers } from '@ckb-lumos/lumos';
import SporeCard from '@/components/SporeCard';
import Link from 'next/link';
import useAddSporeModal from '@/hooks/modal/useAddSporeModal';
import useClusterByIdQuery from '@/hooks/query/useClusterByIdQuery';
import useSporeByClusterQuery from '@/hooks/query/useSporeByClusterQuery';
import useTransferClusterModal from '@/hooks/modal/useTransferClusterModal';
import { useConnect } from '@/hooks/useConnect';
import ClusterService, { Cluster } from '@/cluster';
import SporeService, { Spore } from '@/spore';

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

export const getStaticProps: GetStaticProps<
  ClusterPageProps,
  ClusterPageParams
> = async (context) => {
  const { id } = context.params!;
  const cluster = await ClusterService.shared.get(id as string);
  const spores = await SporeService.shared.list(id as string);
  return {
    props: { cluster, spores },
  };
};

export default function ClusterPage(props: ClusterPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { connected, isOwned } = useConnect();

  const { data: cluster } = useClusterByIdQuery(id as string, props.cluster);
  const { data: spores = [] } = useSporeByClusterQuery(
    id as string,
    props.spores,
  );

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
            href={`/account/${ownerAddress}`}
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
