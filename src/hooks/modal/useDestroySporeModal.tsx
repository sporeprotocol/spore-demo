import {
  predefinedSporeConfigs,
  destroySpore as _destroySpore,
} from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/router';
import useDestroySporeMutation from '../mutation/useDestroySporeMutation';
import { useConnect } from '../useConnect';
import { Spore } from '@/spore';
import DestroySporeModal from '@/components/DestroySporeModal';

export default function useDestroySporeModal(spore: Spore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address } = useConnect();
  const router = useRouter();

  const destroySporeMutation = useDestroySporeMutation();

  const handleSubmit = useCallback(async () => {
    if (!address || !spore) {
      return;
    }
    await destroySporeMutation.mutateAsync({
      outPoint: spore.cell.outPoint!,
      fromInfos: [address],
      config: predefinedSporeConfigs.Aggron4,
    });
    notifications.show({
      color: 'green',
      title: 'Farewell!',
      message: `Your spore has been destroyed.`,
    });
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
