import { predefinedSporeConfigs } from '@spore-sdk/core';
import { config, helpers } from '@ckb-lumos/lumos';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useConnect } from '../useConnect';
import { Spore } from '@/spore';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import TransferModal from '@/components/TransferModal';
import { showSuccess } from '@/utils/notifications';
import useSponsorSporeModal from './useSponsorSporeModal';
import { useSetAtom } from 'jotai';
import { modalStackAtom } from '@/state/modal';

export default function useTransferSporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const setModalStack = useSetAtom(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const { refetch } = trpc.spore.get.useQuery(
    { id: spore?.id },
    { enabled: false },
  );

  const { data: capacityMargin, refetch: refetchCapacityMargin } =
    trpc.spore.getCapacityMargin.useQuery(
      { id: spore?.id },
      { enabled: !!spore && opened },
    );

  const sponsorSporeModal = useSponsorSporeModal(spore);

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
      await transferSporeMutation.mutateAsync({
        outPoint: spore.cell.outPoint!,
        fromInfos: [address],
        toLock: helpers.parseAddress(values.to, {
          config: config.predefined.AGGRON4,
        }),
        config: predefinedSporeConfigs.Aggron4,
        useCapacityMarginAsFee: true,
      });
      showSuccess('Spore Transferred!');
      modals.close(modalId);
    },
    [address, spore, transferSporeMutation, modalId],
  );

  useEffect(() => {
    if (opened) {
      refetchCapacityMargin();
      modals.open({
        modalId,
        title: 'Transfer spore?',
        onClose: close,
        closeOnEscape: !transferSporeMutation.isLoading,
        withCloseButton: !transferSporeMutation.isLoading,
        closeOnClickOutside: !transferSporeMutation.isLoading,
        children: (
          <TransferModal
            type="spore"
            capacityMargin={capacityMargin}
            onSubmit={handleSubmit}
            onSponsor={() => {
              close();
              setModalStack((stack) => [...stack, { open, close }]);
              sponsorSporeModal.open();
            }}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    transferSporeMutation.isLoading,
    handleSubmit,
    opened,
    close,
    modalId,
    capacityMargin,
    sponsorSporeModal,
    setModalStack,
    open,
    refetchCapacityMargin,
  ]);

  return {
    open,
    close,
    loading,
  };
}
