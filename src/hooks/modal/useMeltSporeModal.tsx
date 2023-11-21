import {
  predefinedSporeConfigs,
  meltSpore as _meltSpore,
} from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';
import { useConnect } from '../useConnect';
import MeltSporeModal from '@/components/MeltSporeModal';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import { Spore } from 'spore-graphql';

export default function useMeltSporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const router = useRouter();

  // FIXME
  // const { refetch } = trpc.spore.list.useQuery(
  //   { clusterIds: spore?.clusterId ? [spore.clusterId] : undefined },
  //   { enabled: false },
  // );

  const meltSpore = useCallback(
    async (...args: Parameters<typeof _meltSpore>) => {
      const { txSkeleton } = await _meltSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await sendTransaction(signedTx);
      return hash;
    },
    [signTransaction],
  );

  const meltSporeMutation = useMutation({
    mutationFn: meltSpore,
    onSuccess: () => {
      // refetch();
    },
  });

  const handleSubmit = useCallback(async () => {
    if (!address || !spore) {
      return;
    }
    await meltSporeMutation.mutateAsync({
      outPoint: spore.cell.outPoint!,
      fromInfos: [address],
      config: predefinedSporeConfigs.Aggron4,
    });
    showSuccess('Spore melted!');
    modals.close(modalId);
    if (router.pathname.startsWith('/spore')) {
      router.back();
    }
  }, [address, spore, meltSporeMutation, router, modalId]);

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Melt spore?',
        onClose: close,
        closeOnEscape: !meltSporeMutation.isLoading,
        withCloseButton: !meltSporeMutation.isLoading,
        closeOnClickOutside: !meltSporeMutation.isLoading,
        children: (
          <MeltSporeModal
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
    meltSporeMutation.isLoading,
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
