import {getSporeById, getSporeConfig, unpackToRawSporeData} from '@spore-sdk/core';
import {sporeConfig} from "@/config";
import {Cell, Hash, Indexer, Script} from '@ckb-lumos/lumos';
import {utils} from "@ckb-lumos/base";
import {bytify} from "@ckb-lumos/codec/lib/bytes";

// FIXME Demo solution only
const VIDEO_SPORE_PROTOCOL_CONTENT_TYPE: string = "application/spore+video";
const SPORE_PROTOCOL_CONTENT_TYPE_TRANSFORMED: string = "video/mp4"
const BindingLifecycleLockTypeHash: Hash = '0x20f1117a520a066fa9bf99ace508226b8706d559270c35c81403e057ccdc583d';

export async function GET(_: Request, {params}: { params: { id: string } }) {
    const {id} = params;
    if (!id) {
        return new Response(null, {status: 400});
    }

    try {
        const cell = await getSporeById(id, sporeConfig);
        const spore = unpackToRawSporeData(cell.data);

        if (!spore.contentType.startsWith(VIDEO_SPORE_PROTOCOL_CONTENT_TYPE)) {
            const buffer = await completeSporeContent(cell);
            return new Response(buffer, {
                status: 200,
                headers: {
                    'Content-Type': SPORE_PROTOCOL_CONTENT_TYPE_TRANSFORMED,
                    'Cache-Control': 'public, max-age=31536000',
                },
            });
        }

        const buffer = Buffer.from(spore.content.toString().slice(2), 'hex');
        return new Response(buffer, {
            status: 200,
            headers: {
                'Content-Type': spore.contentType,
                'Cache-Control': 'public, max-age=31536000',
            },
        });
    } catch {
        return new Response(null, {status: 404});
    }
}

async function completeSporeContent(sporeCell: Cell): Promise<Buffer> {
    let segmentCells = await indexSegmentCells(sporeCell);
    sortSegmentCells(segmentCells);
    return jointSegmentCells(segmentCells);
}

async function indexSegmentCells(sporeCell: Cell): Promise<Cell[]> {
    // Env
    const config = getSporeConfig();
    const indexer = new Indexer(config.ckbIndexerUrl, config.ckbNodeUrl);

    // Determine Segment Cell's lockArgs, which is the hash of SporeCell's type script.
    // Note: We can ensure that the SporeCell's type script is not null.
    const sporeCellTypeHash = utils.computeScriptHash(sporeCell.cellOutput.type!);
    const bindingLifecycleLock: Script = {
        hashType: 'type',
        codeHash: BindingLifecycleLockTypeHash,
        args: sporeCellTypeHash,
    }

    // Get Segment Cells
    const segmentCells = await getCellsByLock({lock: bindingLifecycleLock, indexer});
    if (segmentCells.length == 0) {
        throw new Error(`Cannot find Spore Segment Cells, bindingLifecycleLock: ${bindingLifecycleLock}`);
    }

    return segmentCells
}

// Sort the segmentCells by the first byte of outputData, which is the segment index.
function sortSegmentCells(segmentCells: Cell[]) {
    segmentCells.sort((a, b) => {
        const aIndex = a.data[0];
        const bIndex = b.data[0];
        if (aIndex < bIndex) {
            return -1;
        } else if (aIndex > bIndex) {
            return 1;
        } else {
            return 0;
        }
    });
}

// Joint the segmentCells' data to a buffer in order.
function jointSegmentCells(segmentCells: Cell[]): Buffer {
    let buffer = Buffer.alloc(0);

    for (const segmentCell of segmentCells) {
        // Transform the data to bytes.
        const dataInBytes = bytify(segmentCell.data);
        if (dataInBytes.length <= 1) {
            throw new Error(`Unexpect SegmentCell.outputData.length, expect greater than 1, actual is ${dataInBytes.length}`);
        }

        // Skip the first u8 byte which is the identifier of segment index.
        const segmentDataInBytes = dataInBytes.slice(1);
        buffer = Buffer.concat([buffer, segmentDataInBytes]);
    }

    return buffer;
}


async function getCellsByLock(props: { lock: Script; indexer: Indexer }) {
    const collector = props.indexer.collector({
        type: props.lock,
    });

    let cells: Cell[] = [];
    for await (const cell of collector.collect()) {
        cells.push(cell);
    }

    return cells;
}