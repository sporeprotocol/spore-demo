import { createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { isAnyoneCanPay, isSameScript } from '@/utils/script';
import { useConnect } from '../useConnect';
import MintSporeModal from '@/components/MintSporeModal';
import { sendTransaction } from '@/utils/transaction';
import { useMutation } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import { useRouter } from 'next/router';
import { useMantineTheme } from '@mantine/core';
import { getMIMETypeByName } from '@/utils/mime';
import { BI } from '@ckb-lumos/lumos';
import { Cluster } from 'spore-graphql';

export default function useMintSporeModal(id?: string) {
  const [opened, { open, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { address, lock, signTransaction } = useConnect();
  const router = useRouter();
  const modalId = useId();

  // FIXME
  const clusters: Cluster[] = [];
  // const { data: clusters = [] } = trpc.cluster.list.useQuery();
  // const { refetch } = trpc.spore.list.useQuery(
  //   {
  //     clusterIds: id ? [id] : undefined,
  //   },
  //   {
  //     enabled: false,
  //   },
  // );

  const selectableClusters = useMemo(() => {
    return clusters.filter(({ cell }) => {
      return (
        isSameScript(cell?.cellOutput.lock, lock) ||
        isAnyoneCanPay(cell?.cellOutput.lock)
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

  const addSporeMutation = useMutation({
    mutationFn: addSpore,
    onSuccess: () => {
      // FIXME
      // refetch();
    },
  });

  const handleSubmit = useCallback(
    async (
      content: Blob | null,
      clusterId: string | undefined,
      useCapacityMargin?: boolean,
    ) => {
      if (!content || !address || !lock) {
        return;
      }

      const contentBuffer = await content.arrayBuffer();
      const contentType = content.type || getMIMETypeByName(content.name);
      const spore = await addSporeMutation.mutateAsync({
        data: {
          contentType,
          content: new Uint8Array(contentBuffer),
          clusterId,
        },
        fromInfos: [address],
        toLock: lock,
        config: predefinedSporeConfigs.Aggron4,
        // @ts-ignore
        capacityMargin: useCapacityMargin ? BI.from(100_000_000) : BI.from(0),
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
        title: 'Add New Spore',
        onClose: close,
        styles: {
          content: {
            minWidth: isMobile ? 'auto' : '680px',
            minHeight: isMobile ? 'auto' : '525px',
          },
        },
        closeOnEscape: !addSporeMutation.isPending,
        withCloseButton: !addSporeMutation.isPending,
        closeOnClickOutside: !addSporeMutation.isPending,
        children: (
          <MintSporeModal
            defaultClusterId={id!}
            clusters={selectableClusters}
            onSubmit={handleSubmit}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    isMobile,
    modalId,
    addSporeMutation.isPending,
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
