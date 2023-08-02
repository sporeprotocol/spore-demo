import Layout from '@/components/Layout';
import {
  Title,
  Text,
  Flex,
  Button,
  Box,
  SimpleGrid,
  Alert,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { IconAlertCircle } from '@tabler/icons-react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { Spore, getSpores } from '@/spore';
import { Cluster, getCluster, getClusters } from '@/cluster';
import { helpers } from '@ckb-lumos/lumos';
import SporeCard from '@/components/SporeCard';
import useWalletConnect from '@/hooks/useWalletConnect';
import useAddSporeModal from '@/hooks/useAddSporeModal';
import useSporeByClusterQuery from '@/hooks/useSporeByClusterQuery';
import useClusterByIdQuery from '@/hooks/useClusterByIdQuery';

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

  const clusters = await getClusters();
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
  const cluster = await getCluster(id as string);
  const spores = await getSpores(id as string);
  return {
    props: { cluster, spores },
  };
};

export default function ClusterPage(props: ClusterPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { address, connected } = useWalletConnect();
  const addSporeModal = useAddSporeModal(id as string);

  const { data: cluster } = useClusterByIdQuery(id as string, props.cluster);
  const { data: spores = [] } = useSporeByClusterQuery(
    id as string,
    props.spores,
  );

  const ownedCluster = useMemo(() => {
    if (cluster && address) {
      return helpers.encodeToAddress(cluster.cell.cellOutput.lock) === address;
    }
    return false;
  }, [cluster, address]);

  if (!cluster) {
    return null;
  }

  return (
    <Layout>
      <Flex direction="row" justify="space-between" align="end">
        <Flex direction="column">
          <Title order={1}>{cluster.name}</Title>
          <Text>{cluster.description}</Text>
          <Text size="sm" color="gray">
            by {helpers.encodeToAddress(cluster.cell.cellOutput.lock)}
          </Text>
        </Flex>
        {cluster && ownedCluster && (
          <Box style={{ cursor: connected ? 'pointer' : 'not-allowed' }}>
            <Button
              disabled={!connected}
              onClick={addSporeModal.open}
              loading={addSporeModal.loading}
            >
              Add Spore
            </Button>
          </Box>
        )}
      </Flex>

      {!ownedCluster && (
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
