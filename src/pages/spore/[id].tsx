import { Cluster, getCluster } from '@/cluster';
import Layout from '@/components/Layout';
import useClusterByIdQuery from '@/hooks/useClusterByIdQuery';
import useDestroySporeModal from '@/hooks/useDestorySporeModal';
import useSporeByIdQuery from '@/hooks/useSporeByIdQuery';
import useTransferSporeModal from '@/hooks/useTransferSporeModal';
import useWalletConnect from '@/hooks/useWalletConnect';
import { Spore, getSpore, getSpores } from '@/spore';
import { BI, helpers } from '@ckb-lumos/lumos';
import {
  Text,
  Image,
  AspectRatio,
  Card,
  Flex,
  Title,
  Button,
  Box,
} from '@mantine/core';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

export type SporePageProps = {
  cluster?: Cluster;
  spore: Spore | undefined;
};

export type SporePageParams = {
  id: string;
};

export const getStaticPaths: GetStaticPaths<SporePageParams> = async () => {
  if (process.env.SKIP_BUILD_STATIC_GENERATION) {
    return {
      paths: [],
      fallback: 'blocking',
    };
  }

  const spores = await getSpores();
  const paths = spores.map(({ id }) => ({
    params: { id },
  }));
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  SporePageProps,
  SporePageParams
> = async (context) => {
  const { id } = context.params!;
  const spore = await getSpore(id as string);
  const cluster = await getCluster(spore?.clusterId as string);
  if (cluster) {
    return {
      props: { cluster, spore },
    };
  }
  return {
    props: { spore },
  };
};

export default function SporePage(props: SporePageProps) {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useWalletConnect();
  const { data: spore } = useSporeByIdQuery(id as string, props.spore);
  const { data: cluster } = useClusterByIdQuery(
    spore?.clusterId || undefined,
    props.cluster,
  );

  const transferSporeModal = useTransferSporeModal(spore);
  const destroySporeModal = useDestroySporeModal(spore);

  const isOwned = useMemo(() => {
    if (!spore || !address) {
      return false;
    }
    return helpers.encodeToAddress(spore.cell.cellOutput.lock) === address;
  }, [spore, address]);

  if (!spore) {
    return null;
  }

  const owner = helpers.encodeToAddress(spore.cell.cellOutput.lock);

  return (
    <Layout>
      <Flex direction="row">
        <Card withBorder radius="md" mr="md">
          <AspectRatio ratio={1} w="30vw">
            {spore && (
              <Image
                alt={spore.id}
                src={`/api/media/${spore.id}`}
              />
            )}
          </AspectRatio>
        </Card>
        <Flex direction="column" justify="space-between" mt="sm">
          <Box>
            <Link
              href={`/cluster/${spore.clusterId}`}
              style={{ textDecoration: 'none' }}
              prefetch
              passHref
            >
              <Title order={5} color="blue">
                {cluster?.name}
              </Title>
            </Link>
            <Title>{`${id!.slice(0, 10)}...${id!.slice(-10)}`}</Title>
            <Text size="sm" color="gray">
              Owned by {`${owner.slice(0, 10)}...${owner.slice(-10)}`}
            </Text>
            <Card withBorder radius="md" mt="xl">
              <Text mb="sm" color="gray">
                Capacity
              </Text>
              <Title order={3}>
                {BI.from(spore.cell.cellOutput.capacity).toNumber() / 10 ** 8}{' '}
                CKB
              </Title>
            </Card>
          </Box>

          {isOwned && (
            <Flex direction="row" justify="end" gap="md">
              <Button
                size="sm"
                variant="light"
                color="blue"
                radius="md"
                onClick={transferSporeModal.open}
                loading={transferSporeModal.loading}
              >
                Transfer
              </Button>
              <Button
                size="sm"
                variant="light"
                color="red"
                radius="md"
                onClick={destroySporeModal.open}
                loading={destroySporeModal.loading}
              >
                Destroy
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Layout>
  );
}
