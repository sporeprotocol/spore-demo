import { Cell, Indexer, Script } from '@ckb-lumos/lumos';
import {
  ClusterData,
  SporeConfig,
  predefinedSporeConfigs,
} from '@spore-sdk/core';
import pick from 'lodash-es/pick';

const hex2String = (hex: string) => {
  return Buffer.from(hex, 'hex').toString('utf-8');
};

export interface Cluster {
  id: string;
  name: string;
  description: string;
  cell: Pick<Cell, 'outPoint' | 'cellOutput'>;
}

export interface QueryOptions {
  includeContent?: boolean;
}

export default class ClusterService {
  private config: SporeConfig;
  private indexer: Indexer;

  constructor(config: SporeConfig) {
    this.config = config;
    this.indexer = new Indexer(this.config.ckbIndexerUrl);
  }

  public static shared = new ClusterService(predefinedSporeConfigs['Aggron4']);

  private static getClusterFromCell(cell: Cell): Cluster {
    const unpacked = ClusterData.unpack(cell.data);
    const cluster = {
      id: cell.cellOutput.type!.args,
      name: hex2String(unpacked.name.slice(2)),
      description: hex2String(unpacked.description.slice(2)),
      cell: pick(cell, ['cellOutput', 'outPoint']),
    };
    return cluster;
  }

  private get script() {
    return this.config.scripts.Cluster.script;
  }

  public setConfig(config: SporeConfig) {
    this.config = config;
    this.indexer = new Indexer(this.config.ckbIndexerUrl);
  }

  public async get(id: string): Promise<Cluster | undefined> {
    if (!id) {
      return undefined;
    }
    const collector = this.indexer.collector({
      type: { ...this.script, args: id },
    });

    for await (const cell of collector.collect()) {
      const cluster = ClusterService.getClusterFromCell(cell);
      return cluster;
    }

    return undefined;
  }

  public async list(): Promise<Cluster[]> {
    const collector = this.indexer.collector({
      type: { ...this.script, args: '0x' },
    });

    const clusters: Cluster[] = [];
    for await (const cell of collector.collect()) {
      const cluster = ClusterService.getClusterFromCell(cell);
      clusters.push(cluster);
    }

    return clusters;
  }

  public async listByLock(lock: Script): Promise<Cluster[]> {
    const collector = this.indexer.collector({
      type: { ...this.script, args: '0x' },
      lock,
    });

    const clusters: Cluster[] = [];
    for await (const cell of collector.collect()) {
      const cluster = ClusterService.getClusterFromCell(cell);
      clusters.push(cluster);
    }

    return clusters;
  }
}
