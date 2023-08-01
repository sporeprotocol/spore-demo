import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { hexToBlob } from '@/utils';
import {
  Text,
  Image,
  Card,
  Group,
  AspectRatio,
  SimpleGrid,
} from '@mantine/core';
import { IconPhoto } from '@tabler/icons-react';
import Link from 'next/link';
import { useMemo } from 'react';

export interface ClusterCardProps {
  cluster: Cluster;
  spores: Spore[];
}

export default function ClusterCard({ cluster, spores }: ClusterCardProps) {
  const cols = useMemo(() => {
    if (spores.length > 4) {
      return 2;
    }
    return 1;
  }, [spores]);

  return (
    <Card shadow="sm" radius="md" withBorder>
      <Link
        href={`/cluster/${cluster.id}`}
        style={{ textDecoration: 'none' }}
        prefetch
        passHref
      >
        <Card.Section mb="md">
          {spores.length > 0 ? (
            <SimpleGrid cols={cols}>
              {spores.slice(0, cols * cols).map((spore) => {
                const url = URL.createObjectURL(
                  hexToBlob(spore.content.slice(2)),
                );
                return (
                  <AspectRatio ratio={1} key={spore.id}>
                    <Image
                      src={url}
                      alt={spore.id}
                      imageProps={{ onLoad: () => URL.revokeObjectURL(url) }}
                    />
                  </AspectRatio>
                );
              })}
            </SimpleGrid>
          ) : (
            <AspectRatio ratio={1}>
              <IconPhoto stroke={1.5} color="gray" style={{ opacity: 0.3 }} />
            </AspectRatio>
          )}
        </Card.Section>

        <Group position="apart">
          <Text color="black" weight={500}>
            {cluster.name}
          </Text>
        </Group>
        <Text size="sm" color="dimmed">
          {cluster.description}
        </Text>
      </Link>
    </Card>
  );
}
