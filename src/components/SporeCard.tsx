import { Spore } from '@/spore';
import { AspectRatio, Button, Card, Group, Image } from '@mantine/core';

export interface SporeCardProps {
  spore: Spore;
}

export default function SporeCard({ spore }: SporeCardProps) {
  const url = URL.createObjectURL(spore.content);

  return (
    <Card key={spore.id} shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <AspectRatio ratio={1}>
          <Image
            alt={spore.id}
            src={url}
            imageProps={{ onLoad: () => URL.revokeObjectURL(url) }}
          />
        </AspectRatio>
      </Card.Section>

      <Group mt="md">
        <Button variant="light" color="blue" fullWidth mt="md" radius="md">
          Transfer
        </Button>
      </Group>
    </Card>
  );
}
