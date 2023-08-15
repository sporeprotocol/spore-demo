import { Cell, Indexer } from '@ckb-lumos/lumos';
import {
  SporeData,
  predefinedSporeConfigs,
  createSpore as _createSpore,
  transferSpore as _transferSpore,
  destroySpore as _destroySpore,
} from '@spore-sdk/core';
import { Network } from './network';
import pick from 'lodash/pick';

export interface Spore {
  id: string;
  clusterId: string | null;
  content?: string;
  contentType: string;
  cell: Pick<Cell, 'outPoint' | 'cellOutput'>;
}

export function getSporeFromCell(cell: Cell, includeContent?: boolean): Spore {
  const unpacked = SporeData.unpack(cell.data);
  const spore: Spore = {
    id: cell.cellOutput.type!.args,
    contentType: Buffer.from(unpacked.contentType.slice(2), 'hex').toString(),
    clusterId: unpacked.clusterId ?? null,
    cell: pick(cell, ['cellOutput', 'outPoint']),
  };
  if (includeContent) {
    spore.content = unpacked.content;
  }
  return spore;
}

export type QueryOptions = {
  includeContent?: boolean;
  network?: Network;
}

export async function getSpores(clusterId?: string, options?: QueryOptions) {
  const config = predefinedSporeConfigs[options?.network ?? 'Aggron4'];
  const indexer = new Indexer(config.ckbIndexerUrl);
  const collector = indexer.collector({
    type: { ...config.scripts.Spore.script, args: '0x' },
  });

  const spores: Spore[] = [];
  for await (const cell of collector.collect()) {
    const spore = getSporeFromCell(cell, options?.includeContent);
    spores.push(spore);
  }

  if (clusterId) {
    return spores.filter((spore) => spore.clusterId === clusterId);
  }
  return spores;
}

export async function getSpore(id: string, options?: QueryOptions) {
  const config = predefinedSporeConfigs[options?.network ?? 'Aggron4'];
  const indexer = new Indexer(config.ckbIndexerUrl);
  const collector = indexer.collector({
    type: { ...config.scripts.Spore.script, args: id },
  });

  for await (const cell of collector.collect()) {
    const spore = getSporeFromCell(cell, options?.includeContent);
    return spore;
  }
}
