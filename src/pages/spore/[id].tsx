import { getCluster } from '@/cluster';
import Layout from '@/components/Layout';
import useDestroySporeModal from '@/hooks/useDestorySporeModal';
import useTransferSporeModal from '@/hooks/useTransferSporeModal';
import useWalletConnect from '@/hooks/useWalletConnect';
import { getSpore } from '@/spore';
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
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useQuery } from 'wagmi';

export default function SporePage() {
  const router = useRouter();
  const { id } = router.query;
  const { address } = useWalletConnect();
  const { data: spore } = useQuery(['spore', id], () => getSpore(id as string));
  const { data: cluster } = useQuery(
    ['cluster', spore?.clusterId],
    () => getCluster(spore!.clusterId as string),
    {
      enabled: !!spore,
    },
  );

  const transferSporeModal = useTransferSporeModal(spore);
  const destroySporeModal = useDestroySporeModal(spore);

  const isOwned = useMemo(() => {
    if (!spore || !address) {
      return false;
    }
    return helpers.encodeToAddress(spore.cell.cellOutput.lock) === address;
  }, [spore, address]);

  const url = useMemo(() => {
    if (spore?.content instanceof Blob) {
      return URL.createObjectURL(spore.content);
    }
    return null;
  }, [spore]);

  if (!spore) {
    return null;
  }

  const owner = helpers.encodeToAddress(spore.cell.cellOutput.lock);

  return (
    <Layout>
      <Flex direction="row">
        <Card withBorder radius="md" mr="md">
          <AspectRatio ratio={1} w="30vw">
            {url && (
              <Image
                alt={spore!.id}
                src={url}
                imageProps={{ onLoad: () => URL.revokeObjectURL(url) }}
              />
            )}
          </AspectRatio>
        </Card>
        <Flex direction="column" justify="space-between" mt="sm">
          <Box>
            <Link
              href={`/cluster/${spore.clusterId}`}
              passHref
              style={{ textDecoration: 'none' }}
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
