import { Indexer } from '@ckb-lumos/lumos';
import {
  SporeData,
  predefinedSporeConfigs,
  createSpore as _createSpore,
} from '@spore-sdk/core';
import { sendTransaction } from './transaction';

const hex2Blob = (hex: string) => {
  const buffer = Buffer.from(hex, 'hex');
  return new Blob([buffer]);
};

export interface Spore {
  id: string;
  clusterId: string | undefined;
  content: Blob;
}

export async function getSpores(clusterId?: string) {
  const config = predefinedSporeConfigs.Aggron4;
  const indexer = new Indexer(config.ckbIndexerUrl);
  const collector = indexer.collector({
    type: { ...config.scripts.Spore.script, args: '0x' },
  });

  const spores: Spore[] = [];
  for await (const cell of collector.collect()) {
    const unpacked = SporeData.unpack(cell.data);
    const spore = {
      id: cell.cellOutput.type!.args,
      content: hex2Blob(unpacked.content.slice(2)),
      clusterId: unpacked.clusterId,
    };
    spores.push(spore);
  }

  return spores.filter((spore) => spore.clusterId === clusterId);
}

export async function createSpore(...args: Parameters<typeof _createSpore>) {
  const { txSkeleton } = await _createSpore(...args);
  const txHash = await sendTransaction(txSkeleton);
  return txHash;
}
