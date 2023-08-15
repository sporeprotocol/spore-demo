import Connector from '@/connectors/base';
import { walletAtom } from '@/state/wallet';
import { Transaction, config, helpers } from '@ckb-lumos/lumos';
import { useAtomValue } from 'jotai';
import { createContext, useCallback, useContext, useMemo } from 'react';

export const ConnectContext = createContext<{ connectors: Connector[] }>({
  connectors: [],
});

export const ConnectProvider = ConnectContext.Provider;

export const useConnect = () => {
  const { connectors } = useContext(ConnectContext);
  const { address, connectorType } = useAtomValue(walletAtom);
  const connected = !!address;

  const lock = useMemo(() => {
    if (!address) return undefined;
    config.initializeConfig(config.predefined.AGGRON4);
    return helpers.parseAddress(address);
  }, [address]);

  const connect = useCallback(() => {
    if (connectors.length === 1) {
      const [connector] = connectors;
      connector.connect();
    }
  }, [connectors]);

  const signTransaction = useCallback(
    async (
      txSkeleton: helpers.TransactionSkeletonType,
    ): Promise<Transaction> => {
      const connector = connectors.find(
        (connector) => connector.type === connectorType,
      );
      if (!connector) {
        throw new Error(`Connector ${connectorType} not found`);
      }
      const transaction = await connector.signTransaction(txSkeleton);
      return transaction;
    },
    [connectorType, connectors],
  );

  return {
    address,
    connected,
    lock,
    connect,
    signTransaction,
  };
};
