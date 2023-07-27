import useConnect from '@/hooks/useConnect';
import { Spore, transferSpore } from '@/spore';
import { helpers } from '@ckb-lumos/lumos';
import { Button, Group, Modal, TextInput } from '@mantine/core';
import { isNotEmpty, useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

export interface SporeTransferModalProps {
  spore: Spore;
  children: ({
    open,
    isLoading,
  }: {
    open: () => void;
    isLoading: boolean;
  }) => JSX.Element;
}

export default function SporeTransferModal(props: SporeTransferModalProps) {
  const { spore } = props;
  const { address } = useConnect();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  const transferMutaion = useMutation(transferSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries(['spores']);
    },
  });

  const form = useForm({
    initialValues: {
      to: '',
    },

    validate: {
      to: isNotEmpty('address cannot be empty'),
    },
  });

  const handleTransfer = useCallback(
    async (values: { to: string }) => {
      if (!address || !values.to) {
        return;
      }
      try {
        await transferMutaion.mutateAsync({
          sporeOutPoint: spore.cell.outPoint!,
          fromInfos: [address],
          toLock: helpers.parseAddress(values.to),
          config: predefinedSporeConfigs.Aggron4,
        });
        notifications.show({
          color: 'green',
          title: 'Transaction successful!',
          message: `Your spore has been transfer to ${values.to.slice(
            0,
            6,
          )}...${values.to.slice(-6)}.`,
        });
        close();
      } catch (e) {
        notifications.show({
          color: 'red',
          title: 'Error!',
          message: (e as Error).message,
        });
      }
    },
    [address, spore.cell.outPoint, close, transferMutaion],
  );

  return (
    <>
      <Modal opened={opened} onClose={close} title="Transfer Spore">
        <form onSubmit={form.onSubmit(handleTransfer)}>
          <TextInput
            withAsterisk
            label="Transfer to"
            {...form.getInputProps('to')}
          />

          <Group position="right" mt="md">
            <Button type="submit" loading={transferMutaion.isLoading}>
              Submit
            </Button>
          </Group>
        </form>
      </Modal>
      {props.children({ open, isLoading: transferMutaion.isLoading })}
    </>
  );
}
