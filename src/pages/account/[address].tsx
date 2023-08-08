import Layout from '@/components/Layout';
import { SimpleGrid, Box, Title, Tabs, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';
import { Cell, helpers } from '@ckb-lumos/lumos';
import { useClipboard } from '@mantine/hooks';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import useClustersQuery from '@/hooks/query/useClustersQuery';
import useSporesQuery from '@/hooks/query/useSporesQuery';
import { Cluster, getClusters } from '@/utils/cluster';
import { Spore, getSpores } from '@/utils/spore';

export type AccountPageProps = {
  clusters: Cluster[];
  spores: Spore[];
};

export type AccountPageParams = {
  address: string;
};

export const getStaticPaths: GetStaticPaths<AccountPageParams> = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  const addresses = new Set<string>();
  const [clusters, spores] = await Promise.all([getClusters(), getSpores()]);
  const cells = [...clusters, ...spores].map(({ cell }) => cell);
  cells.forEach((cell) => {
    addresses.add(helpers.encodeToAddress(cell.cellOutput.lock));
  });

  const paths = Array.from(addresses).map((address) => ({
    params: { address },
  }));
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<
  AccountPageProps,
  AccountPageParams
> = async (context) => {
  const { address } = context.params!;
  const clusters = await getClusters();
  const spores = await getSpores();

  const isOwned = (cell: Cell) => {
    return helpers.encodeToAddress(cell.cellOutput.lock) === address;
  };

  return {
    props: {
      clusters: clusters.filter(({ cell }) => isOwned(cell)),
      spores: spores.filter(({ cell }) => isOwned(cell)),
    },
  };
};

export default function AccountPage(props: AccountPageProps) {
  const router = useRouter();
  const { address } = router.query;
  const clipboard = useClipboard({ timeout: 500 });
  const clustersQuery = useClustersQuery(props.clusters);
  const sporesQuery = useSporesQuery(props.spores);

  const clusters = useMemo(() => {
    if (!address) return [];
    return (
      clustersQuery.data?.filter(
        ({ cell }) => helpers.encodeToAddress(cell.cellOutput.lock) === address,
      ) || []
    );
  }, [clustersQuery.data, address]);

  const spores = useMemo(() => {
    if (!address) return [];
    return (
      sporesQuery.data?.filter(
        ({ cell }) => helpers.encodeToAddress(cell.cellOutput.lock) === address,
      ) || []
    );
  }, [sporesQuery.data, address]);

  const displayAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  }, [address]);

  return (
    <Layout>
      <Box mt="md">
        <Box sx={{ cursor: 'pointer' }} onClick={() => clipboard.copy(address)}>
          <Tooltip
            label={clipboard.copied ? 'Copied!' : 'Copy'}
            position="bottom"
            withArrow
          >
            <Title sx={{ display: 'inline' }}>{displayAddress}</Title>
          </Tooltip>
        </Box>
        <Tabs defaultValue="clusters" mt="lg">
          <Tabs.List>
            <Tabs.Tab value="clusters">Clusters</Tabs.Tab>
            <Tabs.Tab value="spores">Spores</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="clusters">
            <Box mt="md">
              <Title order={4} color="gray.7">
                {clusters.length} Items
              </Title>
              <SimpleGrid cols={4} mt="sm">
                {clusters.map((cluster: Cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    spores={spores.filter((s) => s.clusterId === cluster.id)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </Tabs.Panel>

          <Tabs.Panel value="spores">
            <Box mt="md">
              <Title order={4} color="gray.7">
                {spores.length} Items
              </Title>
              <SimpleGrid cols={4} mt="sm">
                {spores.map((spore: Spore) => (
                  <SporeCard
                    key={spore.id}
                    spore={spore}
                    cluster={clusters.find((c) => c.id === spore.clusterId)}
                  />
                ))}
              </SimpleGrid>
            </Box>
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Layout>
  );
}
