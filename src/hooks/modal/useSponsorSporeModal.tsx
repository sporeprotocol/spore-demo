import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDisclosure, useId, useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useConnect } from '../useConnect';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showSuccess } from '@/utils/notifications';
import SponsorModal from '@/components/SponsorModal';
import { useMantineTheme } from '@mantine/core';
import { BI, OutPoint, helpers } from '@ckb-lumos/lumos';
import { useAtomValue } from 'jotai';
import { modalStackAtom } from '@/state/modal';
import { QuerySpore } from '../query/type';
import { useSporeQuery } from '../query/useSporeQuery';
import { useSporesByAddressQuery } from '../query/useSporesByAddressQuery';
import { useClusterSporesQuery } from '../query/useClusterSporesQuery';
import { cloneDeep, update } from 'lodash-es';

export default function useSponsorSporeModal(spore: QuerySpore | undefined) {
  const modalId = useId();
  const modalStack = useAtomValue(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, signTransaction } = useConnect();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const ownerAddress = useMemo(() => {
    if (spore?.cell?.cellOutput.lock === undefined) return undefined;
    return helpers.encodeToAddress(spore.cell?.cellOutput.lock, {
      config: predefinedSporeConfigs.Aggron4.lumos,
    });
  }, [spore?.cell?.cellOutput.lock]);
  const queryClient = useQueryClient();
  const { data: { capacityMargin } = {} } = useSporeQuery(opened ? spore?.id : undefined);
  const { refresh: refreshSpore } = useSporeQuery(opened ? spore?.id : undefined, false);
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(
    opened ? address : undefined,
    false,
  );
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(
    opened ? spore?.clusterId ?? undefined : undefined,
    false,
  );
  const nextCapacityMarginRef = useRef<string | undefined>();

  const sponsorSpore = useCallback(
    async (...args: Parameters<typeof _transferSpore>) => {
      const { txSkeleton, outputIndex } = await _transferSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const txHash = await sendTransaction(signedTx);
      return {
        txHash,
        index: BI.from(outputIndex).toHexString(),
      } as OutPoint;
    },
    [signTransaction],
  );

  const onSuccess = useCallback(
    async (outPoint: OutPoint) => {
      if (!spore) return;
      Promise.all([refreshSpore(), refreshSporesByAddress(), refreshClusterSpores()]);
      const capacityMargin = nextCapacityMarginRef.current;
      const capacity = BI.from(spore?.cell?.cellOutput.capacity ?? 0)
        .add(BI.from(capacityMargin).sub(spore?.capacityMargin ?? 0))
        .toHexString();

      const updateSpore = (spore: QuerySpore) => {
        update(spore, 'capacityMargin', () => capacityMargin);
        update(spore, 'cell.cellOutput.capacity', () => capacity);
        update(spore, 'cell.outPoint', () => outPoint);
        return spore;
      };

      queryClient.setQueryData(['spore', spore.id], (data: { spore: QuerySpore }) => {
        if (!data || !data.spore) {
          return data;
        }
        const newSpore = updateSpore(cloneDeep(data.spore));
        return { spore: newSpore };
      });

      const sporesUpdater = (data: { spores: QuerySpore[] }) => {
        if (!data || !data.spores) {
          return data;
        }
        const spores = data.spores.map((spore) => {
          if (spore.id !== spore.id) return spore;
          return updateSpore(cloneDeep(spore));
        });
        return { spores };
      };
      queryClient.setQueryData(['sporesByAddress', ownerAddress], sporesUpdater);
      if (spore.clusterId) {
        queryClient.setQueryData(['clusterSpores', spore.clusterId], sporesUpdater);
      }
    },
    [ownerAddress, queryClient, refreshClusterSpores, refreshSpore, refreshSporesByAddress, spore],
  );

  const sponsorSporeMutation = useMutation({
    mutationFn: sponsorSpore,
    onSuccess,
  });
  const loading = sponsorSporeMutation.isPending && !sponsorSporeMutation.isError;

  const handleSubmit = useCallback(
    async (values: { amount: number }) => {
      if (!address || !values.amount || !spore?.cell) {
        return;
      }
      const { amount } = values;
      const nextCapacityMargin = BI.from(capacityMargin).add(BI.from(amount).mul(100_000_000));
      nextCapacityMarginRef.current = nextCapacityMargin.toHexString();

      await sponsorSporeMutation.mutateAsync({
        outPoint: spore.cell!.outPoint!,
        fromInfos: [address],
        toLock: lock!,
        config: predefinedSporeConfigs.Aggron4,
        capacityMargin: nextCapacityMargin.toHexString(),
        useCapacityMarginAsFee: false,
      });
      showSuccess(`${amount.toLocaleString('en-US')} CKByte sponsored to Spore!`);
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
        closeOnEscape: !sponsorSporeMutation.isPending,
        withCloseButton: !sponsorSporeMutation.isPending,
        closeOnClickOutside: !sponsorSporeMutation.isPending,
        children: <SponsorModal type="spore" data={spore!} onSubmit={handleSubmit} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [
    isMobile,
    sponsorSporeMutation.isPending,
    handleSubmit,
    opened,
    close,
    modalId,
    spore,
    modalStack,
    refreshSpore,
  ]);

  return {
    open,
    close,
    loading,
  };
}
