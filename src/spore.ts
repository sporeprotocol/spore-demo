import { Cell, Indexer, Script } from '@ckb-lumos/lumos';
import {
  SporeConfig,
  SporeData,
  predefinedSporeConfigs,
} from '@spore-sdk/core';
import pick from 'lodash-es/pick';

export interface Spore {
  id: string;
  clusterId: string | null;
  content?: string;
  contentType: string;
  cell: Pick<Cell, 'outPoint' | 'cellOutput'>;
}

export interface QueryOptions {
  includeContent?: boolean;
}

export default class SporeService {
  private config: SporeConfig;
  private indexer: Indexer;

  constructor(config: SporeConfig) {
    this.config = config;
    this.indexer = new Indexer(this.config.ckbIndexerUrl);
  }

  public static shared = new SporeService(predefinedSporeConfigs['Aggron4']);

  private static getSporeFromCell(cell: Cell, includeContent?: boolean): Spore {
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

  private get script() {
    return this.config.scripts.Spore.script;
  }

  public setConfig(config: SporeConfig) {
    this.config = config;
    this.indexer = new Indexer(this.config.ckbIndexerUrl);
  }

  public async get(
    id: string,
    options?: QueryOptions,
  ): Promise<Spore | undefined> {
    const collector = this.indexer.collector({
      type: { ...this.script, args: id },
    });
    for await (const cell of collector.collect()) {
      return SporeService.getSporeFromCell(cell, options?.includeContent);
    }
    return undefined;
  }

  public async list(
    clusterId?: string,
    options?: QueryOptions,
  ): Promise<Spore[]> {
    const collector = this.indexer.collector({
      type: { ...this.script, args: '0x' },
    });

    const spores: Spore[] = [];
    for await (const cell of collector.collect()) {
      const spore = SporeService.getSporeFromCell(
        cell,
        options?.includeContent,
      );
      spores.push(spore);
    }

    if (clusterId) {
      return spores.filter((spore) => spore.clusterId === clusterId);
    }
    return spores;
  }

  public async listByLock(
    lock: Script,
    clusterId?: string,
    options?: QueryOptions,
  ): Promise<Spore[]> {
    const collector = this.indexer.collector({
      type: { ...this.script, args: '0x' },
      lock,
    });

    const spores: Spore[] = [];
    for await (const cell of collector.collect()) {
      const spore = SporeService.getSporeFromCell(
        cell,
        options?.includeContent,
      );
      spores.push(spore);
    }

    if (clusterId) {
      return spores.filter((spore) => spore.clusterId === clusterId);
    }
    return spores;
  }
}
