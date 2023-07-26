import { Cell, Indexer } from '@ckb-lumos/lumos';
import { ClusterData, predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

const hex2String = (hex: string) => {
  return Buffer.from(hex, 'hex').toString('utf-8');
};

export interface Cluster {
  id: string;
  name: string;
  description: string;
  cell: Cell;
}

export default function useClusterCollector() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const indexer = useMemo(
    () => new Indexer(predefinedSporeConfigs.Aggron4.ckbIndexerUrl),
    [],
  );
  const collector = useMemo(
    () => indexer.collector({ type: { ...predefinedSporeConfigs.Aggron4.scripts.Cluster.script, args: '0x' } }),
    [indexer],
  );

  const collect = useCallback(async () => {
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
  }, [collector]);

  const refresh = useCallback(async () => {
    const clusters = await collect();
    setClusters(clusters);
  }, [collect]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    clusters,
    refresh,
  };
}
