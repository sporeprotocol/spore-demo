import { Cell, Indexer } from '@ckb-lumos/lumos';
import {
  ClusterData,
  predefinedSporeConfigs,
  createCluster as _createCluster,
} from '@spore-sdk/core';

const hex2String = (hex: string) => {
  return Buffer.from(hex, 'hex').toString('utf-8');
};

export interface Cluster {
  id: string;
  name: string;
  description: string;
  cell: Cell;
}

export async function getClusters() {
  const config = predefinedSporeConfigs.Aggron4;
  const indexer = new Indexer(config.ckbIndexerUrl);
  const collector = indexer.collector({
    type: { ...config.scripts.Cluster.script, args: '0x' },
  });

  const clusters: Cluster[] = [];
  for await (const cell of collector.collect()) {
    const unpacked = ClusterData.unpack(cell.data);
    const cluster = {
      id: cell.cellOutput.type!.args,
      name: hex2String(unpacked.name.slice(2)),
      description: hex2String(unpacked.description.slice(2)),
      cell,
    };
    clusters.push(cluster);
  }

  return clusters;
}

export async function getCluster(id: string) {
  const clusters = await getClusters();
  return clusters.find((cluster) => cluster.id === id);
}
