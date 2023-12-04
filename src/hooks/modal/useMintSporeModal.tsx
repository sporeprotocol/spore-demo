import { SporeDataProps, createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useState } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { useConnect } from '../useConnect';
import MintSporeModal from '@/components/MintSporeModal';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import { useRouter } from 'next/router';
import { useMantineTheme } from '@mantine/core';
import { getMIMETypeByName } from '@/utils/mime';
import { BI } from '@ckb-lumos/lumos';
import { useSporesByAddressQuery } from '../query/useSporesByAddressQuery';
import { useClusterSporesQuery } from '../query/useClusterSporesQuery';
import { useMintableClustersQuery } from '../query/useMintableClusters';

export default function useMintSporeModal(id?: string) {
  const theme = useMantineTheme();
  const router = useRouter();
  const modalId = useId();

  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { address, lock, signTransaction } = useConnect();

  const queryClient = useQueryClient();
  const [mindedSporeData, setMindedSporeData] = useState<SporeDataProps>();
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(
    opened ? mindedSporeData?.clusterId : undefined,
  );
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(opened ? address : undefined);
  const { data: mintableClusters = [], refresh: refreshMintableClusters } =
    useMintableClustersQuery(opened ? address : undefined);

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

  const onSuccess = useCallback(
    async (_: unknown, variables: { data: SporeDataProps }) => {
      setMindedSporeData(variables.data);
      await Promise.all([refreshSporesByAddress(), refreshClusterSpores()]);
      const sporesUpdater = (data: { spores: SporeDataProps[] }) => {
        return {
          spores: [variables.data, ...data.spores],
        };
      };
      queryClient.setQueryData(['sporesByAddress', address], sporesUpdater);
      if (variables.data.clusterId) {
        queryClient.setQueryData(['clusterSpores', variables.data.clusterId], sporesUpdater);
      }
    },
    [address, queryClient, refreshClusterSpores, refreshSporesByAddress],
  );

  const addSporeMutation = useMutation({
    mutationFn: addSpore,
    onSuccess,
  });

  const handleSubmit = useCallback(
    async (content: Blob | null, clusterId: string | undefined, useCapacityMargin?: boolean) => {
      if (!content || !address || !lock) {
        return;
      }

      const contentBuffer = await content.arrayBuffer();
      const contentType = content.type || getMIMETypeByName(content.name);
      const sporeCell = await addSporeMutation.mutateAsync({
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
        router.push(`/spore/${sporeCell?.cellOutput.type?.args}`);
      });
      close();
    },
    [address, lock, addSporeMutation, close, router],
  );

  useEffect(() => {
    if (opened) {
      refreshMintableClusters();
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
            clusters={mintableClusters}
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
    mintableClusters,
    handleSubmit,
    opened,
    close,
    id,
    refreshMintableClusters,
  ]);

  return {
    open,
    close,
  };
}
