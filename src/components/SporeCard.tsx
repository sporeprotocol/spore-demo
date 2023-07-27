import { getCluster } from '@/cluster';
import { Spore } from '@/spore';
import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  AspectRatio,
  Card,
  Image,
  Flex,
  Group,
  Title,
} from '@mantine/core';
import Link from 'next/link';
import { useQuery } from 'react-query';

export interface SporeCardProps {
  spore: Spore;
}

export default function SporeCard({ spore }: SporeCardProps) {
  const { data: cluster } = useQuery(['cluster', spore.clusterId], () => {
    if (!spore.clusterId) {
      return null;
    }
    return getCluster(spore.clusterId);
  });

  const url = URL.createObjectURL(spore.content);

  return (
    <Link
      href={`/spore/${spore.id}`}
      passHref
      style={{ textDecoration: 'none' }}
    >
      <Card key={spore.id} shadow="sm" radius="md" withBorder>
        <Flex h="100%" direction="column" justify="space-between">
          <Card.Section mb="md">
            <AspectRatio ratio={1}>
              <Image
                alt={spore.id}
                src={url}
                imageProps={{ onLoad: () => URL.revokeObjectURL(url) }}
              />
            </AspectRatio>
          </Card.Section>
          <Group>
            <Flex direction="column">
              {cluster ? (
                <Title order={5}>{cluster.name}</Title>
              ) : (
                <Title
                  order={5}
                  weight="normal"
                  color="gray"
                  sx={{ opacity: 0.5 }}
                >
                  No Cluster
                </Title>
              )}
              <Text size="sm" color="gray">
                {`${spore.id.slice(0, 10)}...${spore.id.slice(-10)}`}
              </Text>
              <Text size="sm">
                {BI.from(spore.cell.cellOutput.capacity).toNumber() / 10 ** 8}{' '}
                CKB
              </Text>
            </Flex>
          </Group>
        </Flex>
      </Card>
    </Link>
  );
}
