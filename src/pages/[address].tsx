import Layout from '@/components/Layout';
import { SimpleGrid, Box, Title, Tabs, Tooltip } from '@mantine/core';
import { useMemo } from 'react';
import ClusterCard from '@/components/ClusterCard';
import SporeCard from '@/components/SporeCard';
import { useClipboard } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { trpc } from '@/server';
import { useConnect } from '@/hooks/useConnect';

export default function AccountPage() {
  const router = useRouter();
  const { address } = router.query;
  const { address: connectedAddress } = useConnect();
  const clipboard = useClipboard({ timeout: 500 });

  const { data: clusters = [] } = trpc.cluster.list.useQuery({
    owner: address as string,
    acp: address === connectedAddress,
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
