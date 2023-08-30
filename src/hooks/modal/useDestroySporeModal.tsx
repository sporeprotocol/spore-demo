import {
  predefinedSporeConfigs,
  destroySpore as _destroySpore,
} from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import { useConnect } from '../useConnect';
import { Spore } from '@/spore';
import DestroySporeModal from '@/components/DestroySporeModal';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { trpc } from '@/server';
import { showSuccess } from '@/utils/notifications';

export default function useDestroySporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const router = useRouter();

  const { refetch } = trpc.spore.list.useQuery(
    { clusterId: spore?.clusterId ?? undefined },
    { enabled: false },
  );

  const destroySpore = useCallback(
    async (...args: Parameters<typeof _destroySpore>) => {
      const { txSkeleton } = await _destroySpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const destroySporeMutation = useMutation(destroySpore, {
    onSuccess: () => refetch(),
  });

  const handleSubmit = useCallback(async () => {
    if (!address || !spore) {
      return;
    }
    await destroySporeMutation.mutateAsync({
      outPoint: spore.cell.outPoint!,
      fromInfos: [address],
      config: predefinedSporeConfigs.Aggron4,
    });
    showSuccess('Spore destroyed!')
    modals.close(modalId);
    router.back();
  }, [address, spore, destroySporeMutation, router, modalId]);

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Destroy spore?',
        onClose: close,
        closeOnEscape: !destroySporeMutation.isLoading,
        withCloseButton: !destroySporeMutation.isLoading,
        closeOnClickOutside: !destroySporeMutation.isLoading,
        children: (
          <DestroySporeModal
            spore={spore}
            onSubmit={handleSubmit}
            onClose={() => modals.close(modalId)}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    modalId,
    destroySporeMutation.isLoading,
    handleSubmit,
    opened,
    close,
    spore,
  ]);

  return {
    open,
    close,
  };
}
