import { commons, config, helpers } from '@ckb-lumos/lumos';
import { useMemo } from 'react';

export default function useCkbAddress(ethAddress: string | undefined) {
  const lock = useMemo(() => {
    return commons.omnilock.createOmnilockScript(
      {
        auth: { flag: 'ETHEREUM', content: ethAddress ?? '0x' },
      },
      { config: config.predefined.AGGRON4 },
    );
  }, [ethAddress]);

  const address = useMemo(() => {
    if (ethAddress && lock) {
      return helpers.encodeToAddress(lock, {
        config: config.predefined.AGGRON4,
      });
    }
    return undefined;
  }, [ethAddress, lock]);
  return { address, lock };
}
