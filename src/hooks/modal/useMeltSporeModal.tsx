import {
  getCellWithStatusByOutPoint,
  getSporeByOutPoint,
  getSporeConfig,
  meltSpore as _meltSpore,
  payFeeByOutput,
  unpackToRawSporeData,
} from "@spore-sdk/core";
import { useCallback, useEffect } from "react";
import { useDisclosure, useId } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useRouter } from "next/router";
import { useConnect } from "../useConnect";
import MeltSporeModal from "@/components/MeltSporeModal";
import { sendTransaction } from "@/utils/transaction";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess } from "@/utils/notifications";
import { QueryCluster, QuerySpore } from "../query/type";
import { useSporesByAddressQuery } from "../query/useSporesByAddressQuery";
import { useClusterSporesQuery } from "../query/useClusterSporesQuery";
import { useSporeQuery } from "../query/useSporeQuery";
import { useClustersByAddressQuery } from "../query/useClustersByAddress";
// import {indexSegmentCells} from "@/app/api/media/[id]/route";
import { indexSegmentCells } from "@/utils/segmentCellIndexer";
import { RPC } from "@ckb-lumos/lumos";
import { number } from "@ckb-lumos/codec";
import { CellDep } from "@ckb-lumos/base";

export default function useMeltSporeModal(sourceSpore: QuerySpore | undefined) {
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const { address, signTransaction } = useConnect();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: spore = sourceSpore, refresh: refreshSpore } = useSporeQuery(sourceSpore?.id, opened);
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(address, false);
  const { refresh: refreshClustersByAddress } = useClustersByAddressQuery(address, false);
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(spore?.clusterId || undefined, false);

  const BindingLifecycleCellDep: CellDep = {
    // outPoint: {
    //   txHash: "0x538d2c816004ff23b0b74d00069dec7630d5878660c8137a4a846b469467b0b1",
    //   index: "0x0",
    // },
    outPoint: {
      txHash: process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_CELL_DEP_OUTPOINT_TXHASH!,
      index: process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_CELL_DEP_OUTPOINT_INDEX!,
    },
    depType: "code",
  };

  const meltSpore = useCallback(
    async (...args: Parameters<typeof _meltSpore>) => {
      let { txSkeleton } = await _meltSpore(...args);

      const props = args[0];
      const sporeCell = await getSporeByOutPoint(props.outPoint, props.config);
      const spore = unpackToRawSporeData(sporeCell.data);
      if (spore.contentType.includes("+spore")) {
        // For video spore, attach segment cells as inputs
        const config = props.config ?? getSporeConfig();

        const segmentCells = await indexSegmentCells(sporeCell);

        // Add segment cells as inputs
        for (const segmentCell of segmentCells) {
          txSkeleton = txSkeleton.update("inputs", (inputs) => inputs.push(segmentCell));
        }

        // Add BindingLifecycleCellDep as cellDep
        txSkeleton = txSkeleton.update("cellDeps", (cellDeps) => cellDeps.push(BindingLifecycleCellDep));

        // Segment cells are going to be melted too,
        // aggregate their capacity to the first output.
        let meltSegmentCapacity = 0;
        for (const segmentCell of segmentCells) {
          meltSegmentCapacity += parseInt(segmentCell.cellOutput.capacity, 16);
        }
        txSkeleton = txSkeleton.update("outputs", (outputs) => {
          let firstOutput = outputs.get(0)!;
          firstOutput.cellOutput.capacity =
            "0x" + (parseInt(firstOutput.cellOutput.capacity) + meltSegmentCapacity).toString(16);
          outputs.set(0, firstOutput);
          return outputs;
        });

        // Pay fee by the spore cell's capacity margin
        txSkeleton = await payFeeByOutput({
          outputIndex: 0,
          txSkeleton,
          config: props.config,
        });
      }

      const signedTx = await signTransaction(txSkeleton);
      const txHash = await sendTransaction(signedTx);
      return txHash;
    },
    [signTransaction]
  );

  const onSuccess = useCallback(async () => {
    refreshSpore();
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

    queryClient.setQueryData(["sporesByAddress", address], sporesUpdater);
    queryClient.setQueryData(["clustersByAddress", address], clustersUpdater);
    queryClient.setQueryData(["clusterSpores", spore?.clusterId], sporesUpdater);

    Promise.all([refreshSporesByAddress(), refreshClustersByAddress(), refreshClusterSpores()]);
  }, [
    address,
    queryClient,
    refreshClusterSpores,
    refreshClustersByAddress,
    refreshSpore,
    refreshSporesByAddress,
    spore,
  ]);

  console.log(process.env, "process env");
  console.log(
    process,
    "jjjj",
    process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_CELL_DEP_OUTPOINT_TXHASH!,
    process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_LOCK_TYPE_HASH
  );

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
    });
    showSuccess("Spore melted!");
    modals.close(modalId);
    if (router.pathname.startsWith("/spore")) {
      router.back();
    }
  }, [address, spore, meltSporeMutation, router, modalId]);

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: "Melt spore?",
        onClose: close,
        closeOnEscape: !meltSporeMutation.isPending,
        withCloseButton: !meltSporeMutation.isPending,
        closeOnClickOutside: !meltSporeMutation.isPending,
        children: <MeltSporeModal spore={spore!} onSubmit={handleSubmit} onClose={() => modals.close(modalId)} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [modalId, meltSporeMutation.isPending, handleSubmit, opened, close, spore]);

  return {
    open,
    close,
  };
}
