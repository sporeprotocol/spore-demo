import { predefinedSporeConfigs } from '@spore-sdk/core';
import { helpers } from '@ckb-lumos/lumos';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useConnect } from '../useConnect';
import { Spore } from '@/spore';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import TransferModal from '@/components/TransferModal';
import { showNotifaction } from '@/utils/notifications';

export default function useTransferSporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const { refetch } = trpc.spore.get.useQuery(
    { id: spore?.id },
    { enabled: false },
  );

  const transferSpore = useCallback(
    async (...args: Parameters<typeof _transferSpore>) => {
      const { txSkeleton } = await _transferSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const transferSporeMutation = useMutation(transferSpore, {
    onSuccess: () => refetch(),
  });
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
        showNotifaction('Spore Transferred!');
        modals.close(modalId);
      } catch (e) {
        notifications.show({
          color: 'red',
          title: 'Error!',
          message: (e as Error).message,
        });
      }
    },
    [address, spore, transferSporeMutation, modalId],
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
        children: <TransferModal onSubmit={handleSubmit} />,
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
