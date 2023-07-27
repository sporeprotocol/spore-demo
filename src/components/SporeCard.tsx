import useConnect from '@/hooks/useConnect';
import { Spore } from '@/spore';
import { helpers } from '@ckb-lumos/lumos';
import { AspectRatio, Button, Card, Group, Image, Flex } from '@mantine/core';
import { useMemo } from 'react';
import SporeTransferModal from './SporeTransferModal';
import SporeDestroyModal from './SporeDestroyModel';

export interface SporeCardProps {
  spore: Spore;
}

export default function SporeCard({ spore }: SporeCardProps) {
  const url = URL.createObjectURL(spore.content);
  const { address } = useConnect();
  const isOwned = useMemo(
    () => helpers.encodeToAddress(spore.cell.cellOutput.lock) === address,
    [spore, address],
  );

  return (
    <>
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

          <Group spacing="sm">
            <SporeTransferModal spore={spore}>
              {({ open }) => (
                <Button
                  size="sm"
                  variant="light"
                  color="blue"
                  radius="md"
                  onClick={open}
                  disabled={!isOwned}
                  fullWidth
                >
                  Transfer
                </Button>
              )}
            </SporeTransferModal>
            <SporeDestroyModal spore={spore}>
              {({ open }) => (
                <Button
                  size="sm"
                  variant="light"
                  color="red"
                  radius="md"
                  onClick={open}
                  disabled={!isOwned}
                  fullWidth
                >
                  destroy
                </Button>
              )}
            </SporeDestroyModal>
          </Group>
        </Flex>
      </Card>
    </>
  );
}
