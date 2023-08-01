import {
  predefinedSporeConfigs,
  destroySpore as _destroySpore,
} from '@spore-sdk/core';
import useWalletConnect from './useWalletConnect';
import { RPC } from '@ckb-lumos/lumos';
import { waitForTranscation } from '@/transaction';
import { useCallback, useEffect } from 'react';
import { useMutation } from 'wagmi';
import { useQueryClient } from 'react-query';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { Button, Flex, Group, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { isNotEmpty, useForm } from '@mantine/form';
import { Spore } from '@/spore';

export default function useDestroySporeModal(spore: Spore | undefined) {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useWalletConnect();
  const queryClient = useQueryClient();

  const destroySpore = useCallback(
    async (...args: Parameters<typeof _destroySpore>) => {
      const rpc = new RPC(predefinedSporeConfigs.Aggron4.ckbNodeUrl);
      const { txSkeleton } = await _destroySpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await rpc.sendTransaction(signedTx, 'passthrough');
      await waitForTranscation(hash);
      return hash;
    },
    [signTransaction],
  );

  const destroySporeMutation = useMutation(destroySpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
    },
  });
  const loading = destroySporeMutation.isLoading;

  const form = useForm({
    initialValues: {
      to: '',
    },
    validate: {
      to: isNotEmpty('address cannot be empty'),
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!address || !spore) {
      return;
    }
    try {
      await destroySporeMutation.mutateAsync({
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
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Error!',
        message: (e as Error).message,
      });
    }
  }, [address, spore, destroySporeMutation, close]);

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId: 'destroy-spore',
        title: 'Destroy spore',
        onClose: close,
        children: (
          <>
            <Text mb="md">Do you want to destroy this spore?</Text>

            <Flex direction="row" justify="flex-end">
              <Group>
                <Button
                  size="xs"
                  variant="default"
                  onClick={close}
                  disabled={destroySporeMutation.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  size="xs"
                  color="red"
                  onClick={handleSubmit}
                  loading={destroySporeMutation.isLoading}
                >
                  Confirm
                </Button>
              </Group>
            </Flex>
          </>
        ),
      });
    } else {
      modals.close('destroy-spore');
    }
  }, [destroySporeMutation.isLoading, handleSubmit, opened, form, close]);

  return {
    open,
    close,
    loading,
  };
}
