import { Cell, Indexer, RPC, Script } from '@ckb-lumos/lumos';
import {
  ClusterData,
  SporeConfig,
  predefinedSporeConfigs,
} from '@spore-sdk/core';
import pick from 'lodash-es/pick';
import SporeService, { Spore } from './spore';

const hex2String = (hex: string) => {
  return Buffer.from(hex, 'hex').toString('utf-8');
};

export interface Cluster {
  id: string;
  name: string;
  description: string;
  cell: Pick<Cell, 'outPoint' | 'cellOutput'>;
  spores?: Spore[];
}

export interface QueryOptions {
  skip?: number;
  limit?: number;
  includeContent?: boolean;
}

export default class ClusterService {
  private config: SporeConfig;
  private indexer: Indexer;
  private rpc: RPC;

  constructor(config: SporeConfig) {
    this.config = config;
    this.indexer = new Indexer(this.config.ckbIndexerUrl);
    this.rpc = new RPC(this.config.ckbNodeUrl);
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
    this.rpc = new RPC(this.config.ckbNodeUrl);
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

  public async list(options?: QueryOptions) {
    const collector = this.indexer.collector({
      type: { ...this.script, args: '0x' },
      order: 'desc',
      skip: options?.skip,
    });

    const clusters: Cluster[] = [];
    let collected = 0;
    for await (const cell of collector.collect()) {
      collected += 1;
      const cluster = ClusterService.getClusterFromCell(cell);
      clusters.push(cluster);
      if (options?.limit && clusters.length === options.limit) {
        break;
      }
    }

    return {
      items: clusters,
      collected,
    };
  }

  public async listByLock(lock: Script, options?: QueryOptions) {
    const collector = this.indexer.collector({
      lock,
      type: { ...this.script, args: '0x' },
      order: 'desc',
      skip: options?.skip,
    });

    const clusters: Cluster[] = [];
    let collected = 0;
    for await (const cell of collector.collect()) {
      collected += 1;
      const cluster = ClusterService.getClusterFromCell(cell);
      clusters.push(cluster);

      if (options?.limit && clusters.length === options.limit) {
        break;
      }
    }

    return {
      items: clusters,
      collected,
    };
  }

  public async recent(limit: number) {
    const recentSpores = await SporeService.shared.recent(limit, true);
    const clusterIds = recentSpores.map((spore) => spore.clusterId);

    const clusters = await Promise.all(
      clusterIds.map(async (id) => {
        const cluster = await this.get(id!);
        const { items: spores } = await SporeService.shared.list(id!, {
          limit: 4,
        });
        return {
          ...cluster!,
          spores,
        };
      }),
    );

    return clusters;
  }
}
