import { commons, config, helpers } from '@ckb-lumos/lumos';
import { useMemo } from 'react';
import { useAccount } from 'wagmi';

export default function useCkbAddress() {
  const { address: ethAddress } = useAccount();
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
