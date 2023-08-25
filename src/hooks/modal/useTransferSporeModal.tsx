import { predefinedSporeConfigs } from '@spore-sdk/core';
import { helpers } from '@ckb-lumos/lumos';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import useTransferSporeMutation from '../mutation/useTransferSporeMutation';
import { useConnect } from '../useConnect';
import { Spore } from '@/spore';
import TransferSporeModal from '@/components/TransferSporeModal';

export default function useTransferSporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address } = useConnect();

  const transferSporeMutation = useTransferSporeMutation();
  const loading =
    transferSporeMutation.isLoading && !transferSporeMutation.isError;

  const handleSubmit = useCallback(
    async (values: { to: string }) => {
      if (!address || !values.to || !spore) {
        return;
      }
      try {
        await transferSporeMutation.mutateAsync({
          outPoint: spore.cell.outPoint!,
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
    [address, spore, transferSporeMutation, close],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Transfer spore?',
        onClose: close,
        closeOnEscape: !transferSporeMutation.isLoading,
        withCloseButton: !transferSporeMutation.isLoading,
        closeOnClickOutside: !transferSporeMutation.isLoading,
        children: (
          <TransferSporeModal
            onSubmit={handleSubmit}
            isLoading={transferSporeMutation.isLoading}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [transferSporeMutation.isLoading, handleSubmit, opened, close, modalId]);

  return {
    open,
    close,
    loading,
  };
}
