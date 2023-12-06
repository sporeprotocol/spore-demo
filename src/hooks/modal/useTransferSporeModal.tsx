import { predefinedSporeConfigs } from '@spore-sdk/core';
import { BI, OutPoint, Script, config, helpers } from '@ckb-lumos/lumos';
import { useCallback, useEffect } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { transferSpore as _transferSpore } from '@spore-sdk/core';
import { useConnect } from '../useConnect';
import { sendTransaction } from '@/utils/transaction';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TransferModal from '@/components/TransferModal';
import { showSuccess } from '@/utils/notifications';
import useSponsorSporeModal from './useSponsorSporeModal';
import { useSetAtom } from 'jotai';
import { modalStackAtom } from '@/state/modal';
import { QuerySpore } from '../query/type';
import { useSporeQuery } from '../query/useSporeQuery';
import { useSporesByAddressQuery } from '../query/useSporesByAddressQuery';
import { useClusterSporesQuery } from '../query/useClusterSporesQuery';
import { cloneDeep, update } from 'lodash-es';

export default function useTransferSporeModal(spore: QuerySpore | undefined) {
  const modalId = useId();
  const setModalStack = useSetAtom(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const queryClient = useQueryClient();
  const { data: { capacityMargin } = {} } = useSporeQuery(opened ? spore?.id : undefined);
  const { refresh: refreshSpore } = useSporeQuery(spore?.id, false);
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(address, false);
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(
    spore?.clusterId || undefined,
    false,
  );

  const sponsorSporeModal = useSponsorSporeModal(spore);

  const transferSpore = useCallback(
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
    async (outPoint: OutPoint, variables: { toLock: Script }) => {
      if (!spore) return;
      await Promise.all([refreshSpore(), refreshSporesByAddress(), refreshClusterSpores()]);
      queryClient.setQueryData(['spore', spore.id], (data: { spore: QuerySpore }) => {
        if (!data || !data.spore) {
          return data;
        }
        const spore = cloneDeep(data.spore);
        update(spore, 'spore.cell.cellOutput.lock', () => variables.toLock);
        update(spore, 'spore.cell.outPoint', () => outPoint);
        return { spore };
      });
      queryClient.setQueryData(['sporesByAddress', address], (data: { spores: QuerySpore[] }) => {
        if (!data || !data.spores) {
          return data;
        }
        const currentSpore = spore;
        const toAddress = helpers.encodeToAddress(variables.toLock, {
          config: config.predefined.AGGRON4,
        });
        if (toAddress !== address) {
          const spores = data.spores.filter((spore) => spore.id !== currentSpore.id);
          return { spores };
        }
        const spores = data.spores.map((spore) => {
          if (spore.id !== spore.id) return spore;
          return {
            ...spore,
            cell: {
              ...spore.cell,
              cellOutput: {
                ...spore.cell?.cellOutput,
                lock: variables.toLock,
              },
              outPoint,
            },
          };
        });
        return { spores };
      });
    },
    [address, queryClient, refreshClusterSpores, refreshSpore, refreshSporesByAddress, spore],
  );

  const transferSporeMutation = useMutation({
    mutationFn: transferSpore,
    onSuccess,
  });
  const loading = transferSporeMutation.isPending && !transferSporeMutation.isError;

  const handleSubmit = useCallback(
    async (values: { to: string }) => {
      if (!address || !values.to || !spore?.cell) {
        return;
      }
      await transferSporeMutation.mutateAsync({
        outPoint: spore.cell.outPoint!,
        fromInfos: [address],
        toLock: helpers.parseAddress(values.to, {
          config: config.predefined.AGGRON4,
        }),
        config: predefinedSporeConfigs.Aggron4,
        useCapacityMarginAsFee: true,
      });
      showSuccess('Spore Transferred!');
      modals.close(modalId);
    },
    [address, spore, transferSporeMutation, modalId],
  );

  useEffect(() => {
    if (opened) {
      refreshSpore();
      modals.open({
        modalId,
        title: 'Transfer spore?',
        onClose: close,
        closeOnEscape: !transferSporeMutation.isPending,
        withCloseButton: !transferSporeMutation.isPending,
        closeOnClickOutside: !transferSporeMutation.isPending,
        children: (
          <TransferModal
            type="spore"
            capacityMargin={capacityMargin || undefined}
            onSubmit={handleSubmit}
            onSponsor={() => {
              close();
              setModalStack((stack) => [...stack, { open, close }]);
              sponsorSporeModal.open();
            }}
          />
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    transferSporeMutation.isPending,
    handleSubmit,
    opened,
    close,
    modalId,
    sponsorSporeModal,
    setModalStack,
    open,
    spore,
    capacityMargin,
    refreshSpore,
  ]);

  return {
    open,
    close,
    loading,
  };
}
