import { SporeDataProps, createSpore, SporeConfig, injectCapacityAndPayFee, getSporeConfig } from "@spore-sdk/core";
import { useCallback, useEffect, useState } from "react";
import { useDisclosure, useId, useMediaQuery } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { useConnect } from "../useConnect";
import MintVideoSporeModal from "@/components/MintVideoSporeModal";
import { sendTransaction } from "@/utils/transaction";
import { useMutation } from "@tanstack/react-query";
import { showSuccess } from "@/utils/notifications";
import { useRouter } from "next/router";
import { useMantineTheme } from "@mantine/core";
import { getMIMETypeByName } from "@/utils/mime";
import { BI, Cell, Hash } from "@ckb-lumos/lumos";
import { useSporesByAddressQuery } from "../query/useSporesByAddressQuery";
import { useClusterSporesQuery } from "../query/useClusterSporesQuery";
import { useMintableClustersQuery } from "../query/useMintableClusters";
import { useClustersByAddressQuery } from "../query/useClustersByAddress";
import { ckbHash, computeScriptHash } from "@ckb-lumos/base/lib/utils";
import { Address, CellDep, OutPoint, Script } from "@ckb-lumos/base";
import { BytesLike } from "@ckb-lumos/codec";
import { FromInfo } from "@ckb-lumos/common-scripts";
import { BIish } from "@ckb-lumos/bi";
import { helpers, HexString, Indexer, RPC } from "@ckb-lumos/lumos";
import { bytify, hexify } from "@ckb-lumos/codec/lib/bytes";

// TODO Demo only
const defaultSegmentSize: number = parseInt(process.env.NEXT_PUBLIC_DEFAULT_SEGMENT_SIZE!, 10) * 1024;
const BindingLifecycleTypeHash: Hash = process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_LOCK_TYPE_HASH!;
const BindingLifecycleCellDep: CellDep = {
  outPoint: {
    txHash: process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_CELL_DEP_OUTPOINT_TXHASH!,
    index: process.env.NEXT_PUBLIC_BINDING_LIFECYCLE_CELL_DEP_OUTPOINT_INDEX!,
  },
  depType: "code",
};

// splitContentIntoSegments splits the content into segments with the specified size.
export function splitContentIntoSegments(content: BytesLike, segmentSize: number): BytesLike[] {
  const buffer = bytify(content);
  const bufferSize = buffer.length;

  const segments: BytesLike[] = [];
  let i = 0;
  let offset = 0;
  while (offset < bufferSize) {
    const segment = buffer.slice(offset, offset + segmentSize);
    const segmentIndex = new Uint8Array([i]);
    const segmentContentWithIndex = new Uint8Array(segmentIndex.length + segment.length);
    segmentContentWithIndex.set(segmentIndex, 0);
    segmentContentWithIndex.set(segment, segmentIndex.length);

    segments.push(segmentContentWithIndex);
    offset += segmentSize;
    i += 1;

    console.error(`Segment ${i} size: ${segment.length} bytes.`);
  }

  return segments;
}

export function getSporeTypeHash(spore: Cell): Hash {
  return computeScriptHash(spore.cellOutput.type!);
}

export function extendContentType(contentType: string): string {
  return contentType + "+spore";
}

export async function mintSporeSegment(
  sporeTypeHash: Hash,
  segment: BytesLike,
  props: {
    data: SporeDataProps;
    toLock: Script;
    fromInfos: FromInfo[];
    changeAddress?: Address;
    updateOutput?: (cell: Cell) => Cell;
    capacityMargin?: BIish | ((cell: Cell, margin: BI) => BIish);
    cluster?: {
      updateOutput?: (cell: Cell) => Cell;
      capacityMargin?: BIish | ((cell: Cell, margin: BI) => BIish);
      updateWitness?: HexString | ((witness: HexString) => HexString);
    };
    clusterAgentOutPoint?: OutPoint;
    clusterAgent?: {
      updateOutput?: (cell: Cell) => Cell;
      capacityMargin?: BIish | ((cell: Cell, margin: BI) => BIish);
      updateWitness?: HexString | ((witness: HexString) => HexString);
    };
    mutant?: {
      paymentAmount?: (minPayment: BI, lock: Script, cell: Cell) => BIish;
    };
    maxTransactionSize?: number | false;
    config?: SporeConfig;
  }
): Promise<{
  txSkeleton: helpers.TransactionSkeletonType;
}> {
  // Env
  const config = props.config ?? getSporeConfig();
  const ckbIndexerUrl = config.ckbIndexerUrl;
  const ckbNodeUrl = config.ckbNodeUrl;
  const indexer = new Indexer(ckbIndexerUrl);
  const rpc = new RPC(ckbNodeUrl);
  const fromInfos = props.fromInfos;

  // Init txSkeleton
  let txSkeleton = helpers.TransactionSkeleton({ cellProvider: indexer });

  // Build Spore Segment Cell's lock script
  // Build Spore Segment Cell
  const sporeSegmentLockScript: Script = {
    codeHash: BindingLifecycleTypeHash,
    hashType: "type",
    args: sporeTypeHash,
  };
  const sporeSegmentOutput: Cell = {
    cellOutput: {
      capacity: "0x0",
      lock: sporeSegmentLockScript,
    },
    data: hexify(segment),
  };

  // Fill the Spore Segment Cell's occupied capacity
  const occupiedCapacity = helpers.minimalCellCapacityCompatible(sporeSegmentOutput);
  sporeSegmentOutput.cellOutput.capacity = "0x" + occupiedCapacity.toString(16);

  // Build the transaction:
  //   - outputs[0]: Spore Segment Cell
  //   - cellDeps[0]: BindingLifecycleCellDep
  //   - cellDeps[1]: SECP256K1_BLAKE160
  txSkeleton = txSkeleton.update("outputs", (outputs) => outputs.push(sporeSegmentOutput));
  txSkeleton = txSkeleton.update("cellDeps", (cellDeps) => cellDeps.push(BindingLifecycleCellDep));
  txSkeleton = txSkeleton.update("cellDeps", (cellDeps) =>
    cellDeps.push({
      outPoint: {
        txHash: config.lumos.SCRIPTS.SECP256K1_BLAKE160!.TX_HASH,
        index: config.lumos.SCRIPTS.SECP256K1_BLAKE160!.INDEX,
      },
      depType: config.lumos.SCRIPTS.SECP256K1_BLAKE160!.DEP_TYPE,
    })
  );

  const injectNeededCapacityResult = await injectCapacityAndPayFee({
    txSkeleton,
    fromInfos: props.fromInfos,
    changeAddress: props.changeAddress,
    config: config,
  });
  txSkeleton = injectNeededCapacityResult.txSkeleton;

  return {
    txSkeleton,
  };
}

export default function useMintVideoSporeModal(id?: string) {
  const theme = useMantineTheme();
  const router = useRouter();
  const modalId = useId();
  const [opened, { open, close }] = useDisclosure(false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { address, lock, signTransaction } = useConnect();
  const clusterId = router.pathname.startsWith("/cluster/") ? (router.query.id as string) : undefined;
  const { refresh: refreshClusterSpores } = useClusterSporesQuery(clusterId, false);
  const { refresh: refreshSporesByAddress } = useSporesByAddressQuery(address, false);
  const { refresh: refreshClustersByAddress } = useClustersByAddressQuery(address, false);
  const { data: mintableClusters = [] } = useMintableClustersQuery(address, opened);

  const addSpore = useCallback(
    async (...args: Parameters<typeof createSpore>) => {
      const props = args[0];
      const data = props.data;

      // Modify Video Spore Cell's data
      const contentHash: Hash = ckbHash(data.content);
      const modifiedContentType: string = extendContentType(data.contentType);
      let { txSkeleton, outputIndex } = await createSpore({
        ...args[0],
        data: {
          ...data,
          contentType: modifiedContentType,
          content: contentHash,
        },
      });

      // Send transaction to create Video Spore Cell
      const signedTx = await signTransaction(txSkeleton);
      await sendTransaction(signedTx);
      const outputs = txSkeleton.get("outputs");
      const spore = outputs.get(outputIndex);
      if (!spore) {
        return spore;
      }

      // Split content into segments
      const defaultSegmentSize = 10 * 1024; // 10kb
      const segmentSize = props.maxTransactionSize || defaultSegmentSize;
      const segments = splitContentIntoSegments(props.data.content, segmentSize);
      console.log(
        `Split Spore ${spore.cellOutput.type!.args} into ${
          segments.length
        } segments, each segment size: ${segmentSize} bytes.`
      );

      // Mint Spore Segment Cells
      const sporeTypeHash = getSporeTypeHash(spore);
      for (const segment of segments) {
        const { txSkeleton: mintSegmentTxSkeleton } = await mintSporeSegment(sporeTypeHash, segment, props);
        const mintSegmentSignedTx = await signTransaction(mintSegmentTxSkeleton);
        const mintSegmentSignedTxHash = await sendTransaction(mintSegmentSignedTx);
        console.log(`Minted Spore Segment Cell with tx hash: ${mintSegmentSignedTxHash}`);
      }

      return spore;
    },
    [signTransaction]
  );

  const addSporeMutation = useMutation({
    mutationFn: addSpore,
    onSuccess: async (_: Cell | undefined) => {
      await Promise.all([refreshClusterSpores(), refreshSporesByAddress(), refreshClustersByAddress()]);
    },
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
        // @ts-ignore
        capacityMargin: useCapacityMargin ? BI.from(100_000_000) : BI.from(0),
      });
      console.log("spore ID top", sporeCell?.cellOutput.type?.args);

      showSuccess("Video Spore minted!", () => {
        router.push(`/spore/${sporeCell?.cellOutput.type?.args}`);
        console.log("spore ID", sporeCell?.cellOutput.type?.args);
      });
      close();
    },
    [address, lock, addSporeMutation, close, router]
  );

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: "Add New Video Spore",
        onClose: close,
        styles: {
          content: {
            minWidth: isMobile ? "auto" : "680px",
            minHeight: isMobile ? "auto" : "525px",
          },
        },
        closeOnEscape: !addSporeMutation.isPending,
        withCloseButton: !addSporeMutation.isPending,
        closeOnClickOutside: !addSporeMutation.isPending,
        children: <MintVideoSporeModal defaultClusterId={id!} clusters={mintableClusters} onSubmit={handleSubmit} />,
      });
    } else {
      modals.close(modalId);
    }
  }, [isMobile, modalId, addSporeMutation.isPending, mintableClusters, handleSubmit, opened, close, id]);

  return {
    open,
    close,
  };
}
