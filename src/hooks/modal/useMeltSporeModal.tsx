import { predefinedSporeConfigs, meltSpore as _meltSpore } from '@spore-sdk/core';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useRouter } from 'next/router';
import { useConnect } from '../useConnect';
import MeltSporeModal from '@/components/MeltSporeModal';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import { QueryCluster, QuerySpore } from '../query/type';
import { useSporesByAddressQuery } from '../query/useSporesByAddressQuery';
import { useClusterSporesQuery } from '../query/useClusterSporesQuery';
import { useSporeQuery } from '../query/useSporeQuery';
import { useClustersByAddressQuery } from '../query/useClustersByAddress';

export default function useMeltSporeModal(spore: QuerySpore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refresh: refreshSpore } = useSporeQuery(spore?.id, false);
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(address, false);
  const { refresh: refreshClustersByAddress } = useClustersByAddressQuery(address, false);
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(
    spore?.clusterId || undefined,
    false,
  );

  const meltSpore = useCallback(
    async (...args: Parameters<typeof _meltSpore>) => {
      const { txSkeleton } = await _meltSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const txHash = await sendTransaction(signedTx);
      return txHash;
    },
    [signTransaction],
  );

  const onSuccess = useCallback(async () => {
    await Promise.all([
      refreshSporesByAddress(),
      refreshClustersByAddress(),
      refreshClusterSpores(),
    ]);

    const sporesUpdater = (data: { spores: QuerySpore[] }) => {
      if (!data || !data.spores) return data;
      const spores = data.spores.filter((s) => s.id !== spore?.id);
      return { spores };
    };
    const clustersUpdater = (data: { clusters: QueryCluster[] }) => {
      if (!data || !data.clusters) return data;
      const clusters = data.clusters.map((c: QueryCluster) => {
        if (c.id === spore?.clusterId) {
          return {
            ...c,
            spores: c.spores?.filter((s) => s.id !== spore.id),
          };
        }
        return c;
      });
      return { clusters };
    };

    queryClient.setQueryData(['sporesByAddress', address], sporesUpdater);
    queryClient.setQueryData(['clustersByAddress', address], clustersUpdater);
    if (spore?.clusterId) {
      queryClient.setQueryData(['clusterSpores', spore.clusterId], sporesUpdater);
    }
  }, [
    address,
    queryClient,
    refreshClusterSpores,
    refreshClustersByAddress,
    refreshSporesByAddress,
    spore?.clusterId,
    spore?.id,
  ]);

  const meltSporeMutation = useMutation({
    mutationFn: meltSpore,
    onSuccess,
  });

  const handleSubmit = useCallback(async () => {
    if (!address || !spore) {
      return;
    }
    await meltSporeMutation.mutateAsync({
      outPoint: spore!.cell!.outPoint!,
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
      refreshSpore();
      modals.open({
        modalId,
        title: 'Melt spore?',
        onClose: close,
        closeOnEscape: !meltSporeMutation.isPending,
        withCloseButton: !meltSporeMutation.isPending,
        closeOnClickOutside: !meltSporeMutation.isPending,
        children: (
          <MeltSporeModal
            spore={spore!}
            onSubmit={handleSubmit}
            onClose={() => modals.close(modalId)}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [modalId, meltSporeMutation.isPending, handleSubmit, opened, close, spore, refreshSpore]);

  return {
    open,
    close,
  };
}
