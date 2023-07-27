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
import { GetServerSideProps } from 'next';
import { Spore, getSpores } from '@/spore';
import { Cluster, getCluster } from '@/cluster';
import { useQuery } from 'react-query';
import useConnect from '@/hooks/useConnect';
import { helpers } from '@ckb-lumos/lumos';
import SporeCard from '@/components/SporeCard';
import SporeAddModal from '@/components/SporeAddModal';

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );

  const { id } = context.query;
  const cluster = await getCluster(id as string);
  return {
    props: { cluster, spores: [] },
  };
};

export type ClusterPageProps = {
  cluster: Cluster;
  spores: Spore[];
};

export default function ClusterPage(props: ClusterPageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { address, isConnected } = useConnect();

  const { data: cluster } = useQuery(
    ['cluster', id],
    () => getCluster(id as string),
    { initialData: props.cluster },
  );
  const { data: spores = [] } = useQuery(
    ['spores', id],
    () => getSpores(id as string),
    { initialData: props.spores },
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
          <SporeAddModal clusterId={cluster.id}>
            {({ open, isLoading }) => (
              <Box style={{ cursor: isConnected ? 'pointer' : 'not-allowed' }}>
                <Button
                  disabled={!isConnected}
                  onClick={open}
                  loading={isLoading}
                >
                  Add Spore
                </Button>
              </Box>
            )}
          </SporeAddModal>
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
            return <SporeCard key={spore.id} spore={spore} />;
          })}
        </SimpleGrid>
      </Box>
    </Layout>
  );
}
