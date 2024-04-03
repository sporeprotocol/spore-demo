import { BI, OutPoint, config, helpers } from "@ckb-lumos/lumos";
import { useCallback, useEffect } from "react";
import { useDisclosure, useId } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  getSporeByOutPoint,
  payFeeByOutput,
  SporeData,
  transferSpore as _transferSpore,
  unpackToRawSporeData,
} from "@spore-sdk/core";
import { useConnect } from "../useConnect";
import { sendTransaction } from "@/utils/transaction";
import { useMutation } from "@tanstack/react-query";
import TransferModal from "@/components/TransferModal";
import { showSuccess } from "@/utils/notifications";
import useSponsorSporeModal from "./useSponsorSporeModal";
import { useSetAtom } from "jotai";
import { modalStackAtom } from "@/state/modal";
import { QuerySpore } from "../query/type";
import { useSporeQuery } from "../query/useSporeQuery";
import { useSporesByAddressQuery } from "../query/useSporesByAddressQuery";
import { useClusterSporesQuery } from "../query/useClusterSporesQuery";
// import {completeSporeContent, indexSegmentCells} from "@/app/api/media/[id]/route";
import { completeSporeContent, indexSegmentCells } from "@/utils/segmentCellIndexer";

export default function useTransferSporeModal(sourceSpore: QuerySpore | undefined) {
  const modalId = useId();
  const setModalStack = useSetAtom(modalStackAtom);
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const { data: spore = sourceSpore, refresh: refreshSpore } = useSporeQuery(sourceSpore?.id, opened);
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(address, false);
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(sourceSpore?.clusterId || undefined, false);
  const { capacityMargin } = spore ?? {};
  const sponsorSporeModal = useSponsorSporeModal(spore);

  const transferSpore = useCallback(
    async (...args: Parameters<typeof _transferSpore>) => {
      let { txSkeleton, outputIndex } = await _transferSpore(...args);

      const props = args[0];
      const sporeCell = await getSporeByOutPoint(props.outPoint, props.config);
      const spore = unpackToRawSporeData(sporeCell.data);
      if (spore.contentType.includes("+spore")) {
        // For video spore, attach segment cells as cellDeps
        const segmentCells = await indexSegmentCells(sporeCell);
        segmentCells.forEach((segmentCell) => {
          txSkeleton = txSkeleton.update("cellDeps", (cellDeps) =>
            cellDeps.push({
              outPoint: segmentCell.outPoint!,
              depType: "code",
            })
          );
        });

        // Pay fee by the spore cell's capacity margin
        txSkeleton = await payFeeByOutput({
          outputIndex,
          txSkeleton,
          config: props.config,
        });
      }

      const signedTx = await signTransaction(txSkeleton);
      const txHash = await sendTransaction(signedTx);
      return {
        txHash,
        index: BI.from(outputIndex).toHexString(),
      } as OutPoint;
    },
    [signTransaction]
  );

  const transferSporeMutation = useMutation({
    mutationFn: transferSpore,
    onSuccess: async () => {
      Promise.all([refreshSporesByAddress(), refreshClusterSpores()]);
      await refreshSpore();
    },
  });
  const loading = transferSporeMutation.isPending && !transferSporeMutation.isError;

  const handleSubmit = useCallback(
    async (values: { to: string; useCapacityMarginAsFee: "1" | "0" }) => {
      if (!address || !values.to || !spore?.cell) {
        return;
      }
      await transferSporeMutation.mutateAsync({
        outPoint: spore.cell.outPoint!,
        fromInfos: [address],
        toLock: helpers.parseAddress(values.to, {
          config: config.predefined.AGGRON4,
        }),
        useCapacityMarginAsFee: values.useCapacityMarginAsFee === "1",
      });
      showSuccess("Spore Transferred!");
      modals.close(modalId);
    },
    [address, spore?.cell, transferSporeMutation, modalId]
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: "Transfer spore?",
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
    capacityMargin,
  ]);

  return {
    open,
    close,
    loading,
  };
}
