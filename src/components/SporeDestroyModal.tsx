import useConnect from '@/hooks/useConnect';
import { Spore, destroySpore } from '@/spore';
import { Text, Button, Flex, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

export interface SporeDestroyModalProps {
  spore: Spore;
  children: ({
    open,
    isLoading,
  }: {
    open: () => void;
    isLoading: boolean;
  }) => JSX.Element;
}

export default function SporeDestroyModal(props: SporeDestroyModalProps) {
  const { spore } = props;
  const queryClient = useQueryClient();
  const { address } = useConnect();
  const [opened, { open, close }] = useDisclosure(false);

  const destroyMutaion = useMutation(destroySpore, {
    onSuccess: () => {
      queryClient.invalidateQueries(['spores']);
    },
  });

  const handleDestroy = useCallback(async () => {
    if (!address) {
      return;
    }
    await destroyMutaion.mutateAsync({
      sporeOutPoint: spore.cell.outPoint!,
      fromInfos: [address],
      config: predefinedSporeConfigs.Aggron4,
    });
    notifications.show({
      color: 'green',
      title: 'Farewell!',
      message: `Your spore has been destroyed.`,
    });
    close();
  }, [address, spore.cell.outPoint, close, destroyMutaion]);

  return (
    <>
      <Modal opened={opened} onClose={close} radius="md" title="destroy Spore">
        <Text mb="md">Do you want to destroy this spore?</Text>

        <Flex direction="row" justify="flex-end">
          <Group>
            <Button
              size="xs"
              variant="default"
              onClick={close}
              disabled={destroyMutaion.isLoading}
            >
              Cancel
            </Button>
            <Button
              size="xs"
              color="red"
              onClick={handleDestroy}
              loading={destroyMutaion.isLoading}
            >
              Confirm
            </Button>
          </Group>
        </Flex>
      </Modal>
      {props.children({ open, isLoading: destroyMutaion.isLoading })}
    </>
  );
}
