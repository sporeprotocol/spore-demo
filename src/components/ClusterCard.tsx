import { Cluster } from '@/cluster';
import { Text, Card, Group, Button } from '@mantine/core';
import Link from 'next/link';

export interface ClusterCardProps {
  cluster: Cluster;
}

export default function ClusterCard({ cluster }: ClusterCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group position="apart">
        <Text weight={500}>{cluster.name}</Text>
      </Group>
      <Text size="sm" color="dimmed">
        {cluster.description}
      </Text>
      <Link
        href={`/cluster/${cluster.id}`}
        style={{ textDecoration: 'none' }}
        passHref
      >
        <Button variant="light" color="blue" fullWidth mt="md" radius="md">
          More
        </Button>
      </Link>
    </Card>
  );
}
