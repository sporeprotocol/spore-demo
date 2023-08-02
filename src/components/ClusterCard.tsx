import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import {
  Text,
  Image,
  Card,
  Group,
  AspectRatio,
  SimpleGrid,
  Flex,
  Title,
  Box,
} from '@mantine/core';
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
    <Card pt="0" shadow="sm" radius="md" withBorder>
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
                return (
                  <AspectRatio key={spore.id} ratio={1}>
                    <Image src={`/api/media/${spore.id}`} alt={spore.id} />
                  </AspectRatio>
                );
              })}
            </SimpleGrid>
          ) : (
            <AspectRatio ratio={1}>
              <Flex justify="center" align="center" bg="gray.1">
                <Title color="gray.4" order={2}>
                  No Spores
                </Title>
              </Flex>
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
