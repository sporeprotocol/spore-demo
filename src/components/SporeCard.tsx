import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { hexToBlob } from '@/utils';
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

export interface SporeCardProps {
  cluster: Cluster | undefined;
  spore: Spore;
}

export default function SporeCard({ cluster, spore }: SporeCardProps) {
  const url = spore.content ? URL.createObjectURL(hexToBlob(spore.content.slice(2))) : '';

  return (
    <Link
      href={`/spore/${spore.id}`}
      style={{ textDecoration: 'none' }}
      prefetch
      passHref
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
