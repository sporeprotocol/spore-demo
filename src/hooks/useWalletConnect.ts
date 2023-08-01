import { Transaction, config, helpers } from '@ckb-lumos/lumos';
import { useLocalStorage } from '@mantine/hooks';
import { useCallback, useMemo } from 'react';
import superjson from 'superjson';
import useCKBullSigner from './useCKBullSigner';
import useMetaMask from './useMetaMask';

const defaultValue = {
  address: '',
  connected: false,
  connectorType: 'metamask' as 'metamask' | 'ckbull',
};

interface Connector {
  connect(): void;
  signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction>;
}

export function useWalletStore() {
  const [wallet, setWallet] = useLocalStorage<typeof defaultValue>({
    key: 'spore.wallet',
    defaultValue,
    serialize: superjson.stringify,
    deserialize: (str) =>
      str === undefined ? defaultValue : superjson.parse(str),
  });

  const { address, connected, connectorType } = wallet;

  const update = useCallback((values: Partial<typeof defaultValue>) => {
    setWallet({
      ...wallet,
      ...values,
    });
  }, [setWallet, wallet])

  return {
    address,
    connected,
    connectorType,
    update,
  };
}

export default function useWalletConnect() {
  const { address, connected = false, connectorType } = useWalletStore();
  const ckbullSigner = useCKBullSigner();
  const metaMask = useMetaMask();

  const lock = useMemo(() => {
    config.initializeConfig(config.predefined.AGGRON4);
    return address ? helpers.parseAddress(address) : undefined;
  }, [address]);

  const connector: Connector = useMemo(
    () => (connectorType === 'ckbull' ? ckbullSigner : metaMask),
    [ckbullSigner, metaMask, connectorType],
  );

  const connect = useMemo(() => connector.connect, [connector]);
  const signTransaction = useMemo(() => connector.signTransaction, [connector]);

  return {
    address,
    lock,
    connected,
    connector,
    connect,
    signTransaction,
  };
}
