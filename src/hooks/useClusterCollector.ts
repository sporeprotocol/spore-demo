import { Cell, Indexer, Script } from '@ckb-lumos/lumos';
import { ClusterData, predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

const sporeClusterTypeScript: Script = {
  codeHash:
    '0x4d54365c46a085a48a087363053c084f103c8168467602876b6b232d24d6c3d3',
  hashType: 'data1',
  args: '0x',
};

const hex2String = (hex: string) => {
  return Buffer.from(hex, 'hex').toString('utf-8');
};

export interface Cluster {
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
    () => indexer.collector({ type: sporeClusterTypeScript }),
    [indexer],
  );

  const collect = useCallback(async () => {
    const clusters: Cluster[] = [];
    for await (const cell of collector.collect()) {
      const unpacked = ClusterData.unpack(cell.data);
      const cluster = {
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

  console.log(clusters);
  return {
    clusters,
    refresh,
  };
}
