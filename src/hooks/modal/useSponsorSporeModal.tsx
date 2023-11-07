import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useConnect } from '../useConnect';
import { Spore } from '@/spore';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import { showSuccess } from '@/utils/notifications';
import SponsorModal from '@/components/SponsorModal';
import { useMantineTheme } from '@mantine/core';
import { BI } from '@ckb-lumos/lumos';
import { useAtomValue } from 'jotai';
import { modalStackAtom } from '@/state/modal';

export default function useSponsorSporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const modalStack = useAtomValue(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, signTransaction } = useConnect();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const { refetch } = trpc.spore.get.useQuery(
    { id: spore?.id },
    { enabled: false },
  );

  const { data: capacityMargin } = trpc.spore.getCapacityMargin.useQuery(
    { id: spore?.id },
    { enabled: !!spore && opened },
  );

  const sponsorSpore = useCallback(
    async (...args: Parameters<typeof _transferSpore>) => {
      const { txSkeleton } = await _transferSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const sponsorSporeMutation = useMutation(sponsorSpore, {
    onSuccess: () => refetch(),
  });
  const loading =
    sponsorSporeMutation.isLoading && !sponsorSporeMutation.isError;

  const handleSubmit = useCallback(
    async (values: { amount: number }) => {
      if (!address || !values.amount || !spore) {
        return;
      }
      const { amount } = values;
      const newCapacity = BI.from(capacityMargin).add(
        BI.from(amount).mul(100_000_000),
      );

      await sponsorSporeMutation.mutateAsync({
        outPoint: spore.cell.outPoint!,
        fromInfos: [address],
        toLock: lock!,
        config: predefinedSporeConfigs.Aggron4,
        capacityMargin: newCapacity.toHexString(),
        useCapacityMarginAsFee: false,
      });
      showSuccess(`${amount.toLocaleString('en-US')} CKB sponsored to Spore!`);
      modals.close(modalId);
    },
    [address, spore, sponsorSporeMutation, modalId, lock, capacityMargin],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Sponsor Spore',
        onClose: () => {
          close();
          const nextModal = modalStack.pop();
          if (nextModal) {
            nextModal.open();
          }
        },
        styles: {
          content: {
            minWidth: isMobile ? 'auto' : '560px',
          },
        },
        closeOnEscape: !sponsorSporeMutation.isLoading,
        withCloseButton: !sponsorSporeMutation.isLoading,
        closeOnClickOutside: !sponsorSporeMutation.isLoading,
        children: (
          <SponsorModal type="spore" data={spore!} onSubmit={handleSubmit} />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    isMobile,
    sponsorSporeMutation.isLoading,
    handleSubmit,
    opened,
    close,
    modalId,
    spore,
    modalStack,
  ]);

  return {
    open,
    close,
    loading,
  };
}
