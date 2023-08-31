import { createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { isAnyoneCanPay, isSameScript } from '@/utils/script';
import { useConnect } from '../useConnect';
import { trpc } from '@/server';
import MintSporeModal from '@/components/MintSporeModal';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from 'react-query';
import { showSuccess } from '@/utils/notifications';
import { useRouter } from 'next/router';

export default function useMintSporeModal(id?: string) {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, signTransaction } = useConnect();
  const router = useRouter();
  const modalId = useId();

  const { data: clusters = [] } = trpc.cluster.list.useQuery();
  const { refetch } = trpc.spore.list.useQuery(
    {
      clusterId: id,
    },
    {
      enabled: false,
    },
  );

  const selectableClusters = useMemo(() => {
    return clusters.filter(({ cell }) => {
      return (
        isSameScript(cell.cellOutput.lock, lock) ||
        isAnyoneCanPay(cell.cellOutput.lock)
      );
    });
  }, [clusters, lock]);

  const addSpore = useCallback(
    async (...args: Parameters<typeof createSpore>) => {
      let { txSkeleton, outputIndex } = await createSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      await sendTransaction(signedTx);
      const outputs = txSkeleton.get('outputs');
      const spore = outputs.get(outputIndex);
      return spore;
    },
    [signTransaction],
  );

  const addSporeMutation = useMutation(addSpore, {
    onSuccess: () => {
      refetch();
    },
  });

  const handleSubmit = useCallback(
    async (content: Blob | null, clusterId: string | undefined) => {
      if (!content || !address || !lock) {
        return;
      }

      const contentBuffer = await content.arrayBuffer();
      const spore = await addSporeMutation.mutateAsync({
        data: {
          contentType: content.type,
          content: new Uint8Array(contentBuffer),
          clusterId,
        },
        fromInfos: [address],
        toLock: lock,
        config: predefinedSporeConfigs.Aggron4,
      });
      showSuccess('Spore minted!', () => {
        router.push(`/spore/${spore?.cellOutput.type?.args}`);
      });
      close();
    },
    [address, lock, addSporeMutation, close, router],
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Add New spore',
        onClose: close,
        styles: {
          content: {
            minWidth: '680px',
            minHeight: '525px',
          },
        },
        closeOnEscape: !addSporeMutation.isLoading,
        withCloseButton: !addSporeMutation.isLoading,
        closeOnClickOutside: !addSporeMutation.isLoading,
        children: (
          <MintSporeModal
            defaultClusterId={id}
            clusters={selectableClusters}
            onSubmit={handleSubmit}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    modalId,
    addSporeMutation.isLoading,
    selectableClusters,
    handleSubmit,
    opened,
    close,
    id,
  ]);

  return {
    open,
    close,
  };
}
