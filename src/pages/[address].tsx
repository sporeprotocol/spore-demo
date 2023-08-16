import Layout from '@/components/Layout';
import { SimpleGrid, Box, Title, Tabs, Tooltip } from '@mantine/core';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
import { useMemo } from 'react';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';
import { helpers } from '@ckb-lumos/lumos';
import { useClipboard } from '@mantine/hooks';
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import { useRouter } from 'next/router';
import ClusterService, { Cluster } from '@/cluster';
import SporeService, { Spore } from '@/spore';
import { appRouter } from '@/server/routers';
import { trpc } from '@/server';

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
  const [clusters, spores] = await Promise.all([
    ClusterService.shared.list(),
    SporeService.shared.list(),
  ]);
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

export const getStaticProps = async (
  context: GetStaticPropsContext<AccountPageParams>,
) => {
  const { address } = context.params!;
  const trpcHelpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: superjson,
  });

  await Promise.all([
    trpcHelpers.cluster.list.prefetch({ owner: address }),
    trpcHelpers.spore.list.prefetch({ owner: address }),
  ]);

  return {
    props: {
      trpcState: trpcHelpers.dehydrate(),
    },
  };
};

export default function AccountPage() {
  const router = useRouter();
  const { address } = router.query;
  const clipboard = useClipboard({ timeout: 500 });

  const { data: clusters = [] } = trpc.cluster.list.useQuery({
    owner: address as string,
  });
  const { data: spores = [] } = trpc.spore.list.useQuery({
    owner: address as string,
  });

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
