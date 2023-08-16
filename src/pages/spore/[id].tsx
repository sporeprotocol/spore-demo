import Layout from '@/components/Layout';
import useDestroySporeModal from '@/hooks/modal/useDestroySporeModal';
import useTransferSporeModal from '@/hooks/modal/useTransferSporeModal';
import { useConnect } from '@/hooks/useConnect';
import SporeService from '@/spore';
import { createServerSideHelpers } from '@trpc/react-query/server';
import superjson from 'superjson';
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
import { GetStaticPaths, GetStaticPropsContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { trpc } from '@/server';
import { appRouter } from '@/server/routers';

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

  const spores = await SporeService.shared.list();
  const paths = spores.map(({ id }) => ({
    params: { id },
  }));
  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps = async (
  context: GetStaticPropsContext<SporePageParams>,
) => {
  const { id } = context.params!;
  const trpcHelpers = createServerSideHelpers({
    router: appRouter,
    ctx: {},
    transformer: superjson,
  });

  await trpcHelpers.spore.get.prefetch({ id });
  return {
    props: {
      trpcState: trpcHelpers.dehydrate(),
    },
  };
};

export default function SporePage() {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useConnect();
  const { data: spore } = trpc.spore.get.useQuery({ id: id as string });
  const { data: cluster } = trpc.cluster.get.useQuery(
    { id: spore?.clusterId ?? undefined },
    { enabled: !!spore?.clusterId },
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
              <Image alt={spore.id} src={`/api/v1/media/${spore.id}`} />
            )}
          </AspectRatio>
        </Card>
        <Flex direction="column" justify="space-between" mt="sm">
          <Box>
            <Link
              href={`/cluster/${spore.clusterId}`}
              style={{ textDecoration: 'none' }}
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
