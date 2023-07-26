import { Cell, Indexer } from '@ckb-lumos/lumos';
import { SporeData, predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo, useState } from 'react';

const hex2Blob = (hex: string) => {
  const buffer = Buffer.from(hex, 'hex');
  return new Blob([buffer]);
};

export interface Spore {
  cell: Cell;
  id: string;
  clusterId: string | undefined;
  content: Blob;
}

export default function useSporeCollector(clusterId?: string) {
  const [spores, setSpores] = useState<Spore[]>([]);
  const indexer = useMemo(
    () => new Indexer(predefinedSporeConfigs.Aggron4.ckbIndexerUrl),
    [],
  );
  const collector = useMemo(
    () =>
      indexer.collector({
        type: {
          ...predefinedSporeConfigs.Aggron4.scripts.Spore.script,
          args: '0x',
        },
      }),
    [indexer],
  );

  const collect = useCallback(async () => {
    const spores: Spore[] = [];
    for await (const cell of collector.collect()) {
      const unpacked = SporeData.unpack(cell.data);
      console.log(unpacked);
      const spore = {
        id: cell.cellOutput.type!.args,
        content: hex2Blob(unpacked.content.slice(2)),
        clusterId: unpacked.clusterId,
        cell,
      };
      spores.push(spore);
    }
    return spores;
  }, [collector]);

  const refresh = useCallback(async () => {
    const clusters = await collect();
    setSpores(clusters);
  }, [collect]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    spores: spores.filter((spore) => spore.clusterId === clusterId),
    refresh,
  };
}
