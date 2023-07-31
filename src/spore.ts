import { Cell, Indexer } from '@ckb-lumos/lumos';
import {
  SporeData,
  predefinedSporeConfigs,
  createSpore as _createSpore,
  transferSpore as _transferSpore,
  destroySpore as _destroySpore,
} from '@spore-sdk/core';

const hex2Blob = (hex: string) => {
  const buffer = Buffer.from(hex, 'hex');
  return new Blob([buffer]);
};

export interface Spore {
  id: string;
  clusterId: string | undefined;
  content: Blob;
  cell: Cell;
}

export function getSporeFromCell(cell: Cell): Spore {
  const unpacked = SporeData.unpack(cell.data);
  return {
    id: cell.cellOutput.type!.args,
    content: hex2Blob(unpacked.content.slice(2)),
    clusterId: unpacked.clusterId,
    cell,
  };
}

export async function getSpores(clusterId?: string) {
  const config = predefinedSporeConfigs.Aggron4;
  const indexer = new Indexer(config.ckbIndexerUrl);
  const collector = indexer.collector({
    type: { ...config.scripts.Spore.script, args: '0x' },
  });

  const spores: Spore[] = [];
  for await (const cell of collector.collect()) {
    const spore = getSporeFromCell(cell);
    spores.push(spore);
  }

  if (clusterId) {
    return spores.filter((spore) => spore.clusterId === clusterId);
  }
  return spores;
}

export async function getSpore(id: string) {
  const spores = await getSpores();
  return spores.find((spore) => spore.id === id);
}
