import { commons, config, helpers } from '@ckb-lumos/lumos';
import { useMemo } from 'react';
import {
  useAccount as useWagmiAccount,
  useConnect as useWagmiConnect,
} from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function useConnect() {
  const { connect } = useWagmiConnect({
    connector: new InjectedConnector(),
  });
  const { address: ethAddress, isConnected } = useWagmiAccount();

  const address = useMemo(() => {
    if (ethAddress) {
      config.initializeConfig(config.predefined.AGGRON4);
      const lock = commons.omnilock.createOmnilockScript({
        auth: { flag: 'ETHEREUM', content: ethAddress ?? '0x' },
      });
      return helpers.encodeToAddress(lock);
    }
    return undefined;
  }, [ethAddress]);

  const lock = useMemo(() => {
    if (address) {
      return helpers.parseAddress(address);
    }
    return undefined;
  }, [address]);

  return {
    address,
    lock,
    connect,
    isConnected,
  };
}
