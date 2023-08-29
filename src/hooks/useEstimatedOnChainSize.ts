import { useEffect, useState } from 'react';
import { useConnect } from './useConnect';
import { createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import { BI } from '@ckb-lumos/lumos';
import { isSameScript } from '@/utils/script';

export default function useEstimatedOnChainSize(
  clusterId: string | undefined,
  content: Blob | null,
) {
  const { address, lock } = useConnect();
  const [onChainSize, setOnChainSize] = useState(0);

  useEffect(() => {
    if (!content || !address || !lock) {
      setOnChainSize(0);
      return;
    }

    const estimate = async () => {
      try {
        const contentBuffer = await content.arrayBuffer();
        const { txSkeleton } = await createSpore({
          data: {
            contentType: content.type,
            content: new Uint8Array(contentBuffer),
            clusterId,
          },
          fromInfos: [address],
          toLock: lock,
          config: predefinedSporeConfigs.Aggron4,
        });

        const inputs = txSkeleton.get('inputs');
        const capacity = inputs
          .filter((input) => isSameScript(input.cellOutput.lock, lock))
          .reduce((sum, input) => {
            return sum.add(BI.from(input.cellOutput.capacity));
          }, BI.from(0));

        return Math.ceil(capacity.toNumber() / 10 ** 8);
      } catch (error) {
        return Math.ceil(content.size);
      }
    };
    estimate().then((size) => {
      setOnChainSize(size);
    });
  }, [content, address, lock, clusterId]);

  return onChainSize;
}
