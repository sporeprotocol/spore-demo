import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { isAnyoneCanPay, isSameScript } from '@/utils/script';
import useMintSporeMutation from '../mutation/useMintSporeMutation';
import { useConnect } from '../useConnect';
import { trpc } from '@/server';
import MintSporeModal from '@/components/MintSporeModal';

export default function useMintSporeModal(id?: string) {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock } = useConnect();
  const modalId = useId();

  const { data: clusters = [] } = trpc.cluster.list.useQuery();

  const selectableClusters = useMemo(() => {
    return clusters.filter(({ cell }) => {
      return (
        isSameScript(cell.cellOutput.lock, lock) ||
        isAnyoneCanPay(cell.cellOutput.lock)
      );
    });
  }, [clusters, lock]);

  const addSporeMutation = useMintSporeMutation();
  const loading = addSporeMutation.isLoading && !addSporeMutation.isError;

  const handleSubmit = useCallback(
    async (content: Blob | null, clusterId: string | undefined) => {
      if (!content || !address || !lock) {
        return;
      }

      const contentBuffer = await content.arrayBuffer();
      await addSporeMutation.mutateAsync({
        data: {
          contentType: content.type,
          content: new Uint8Array(contentBuffer),
          clusterId,
        },
        fromInfos: [address],
        toLock: lock,
        config: predefinedSporeConfigs.Aggron4,
      });
      notifications.show({
        color: 'green',
        title: 'Congratulations!',
        message: 'Your spore has been successfully minted.',
      });
      close();
    },
    [address, lock, addSporeMutation, close],
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
    loading,
  };
}
