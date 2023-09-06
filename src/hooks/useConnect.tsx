import ConnectModal from '@/components/ConnectModal';
import CKBConnector from '@/connectors/base';
import { defaultWalletValue, walletAtom } from '@/state/wallet';
import { showError } from '@/utils/notifications';
import { Script, Transaction, config, helpers } from '@ckb-lumos/lumos';
import { modals } from '@mantine/modals';
import { useAtom } from 'jotai';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const ConnectContext = createContext<{
  autoConnect?: boolean;
  connectors: CKBConnector[];
}>({
  autoConnect: false,
  connectors: [],
});

export const ConnectProvider = ConnectContext.Provider;

export const useConnect = () => {
  const { connectors, autoConnect } = useContext(ConnectContext);
  const [{ address, connectorType }, setWallet] = useAtom(walletAtom);
  const [autoConnected, setAuthConnected] = useState(false);
  const connected = !!address;

  const lock = useMemo(() => {
    if (!address) return undefined;
    return helpers.parseAddress(address, { config: config.predefined.AGGRON4 });
  }, [address]);

  const connector = useMemo(
    () =>
      connectors.find(
        (connector) =>
          connector.type.toLowerCase() === connectorType.toLowerCase(),
      ),
    [connectors, connectorType],
  );

  // auto connect
  useEffect(() => {
    if (autoConnected) {
      return;
    }

    if (address && autoConnect && !connector?.isConnected) {
      setAuthConnected(true);
      connector?.connect().catch((e) => {
        showError((e as Error).message);
      });
    }
  }, [autoConnected, autoConnect, connector, address, setWallet]);

  // clear wallet when connector is removed
  useEffect(() => {
    if (
      connectorType !== '' &&
      !connectors.some(
        (connector) =>
          connector.type.toLowerCase() === connectorType.toLowerCase(),
      )
    ) {
      setWallet(defaultWalletValue);
    }
  }, [connectors, connectorType, setWallet]);

  useEffect(() => {
    modals.close('connect wallet');
  }, [connected]);

  const connect = useCallback(() => {
    if (connectors.length === 0) {
      throw new Error('No connector found');
    }

    if (connectors.length === 1) {
      try {
        const [connector] = connectors;
        connector.connect();
        return;
      } catch (e) {
        showError((e as Error).message);
      }
    }

    modals.open({
      modalId: 'connect wallet',
      title: 'Select a wallet',
      children: <ConnectModal connectors={connectors} />,
    });
  }, [connectors]);

  const disconnect = useCallback(() => {
    if (!connector) {
      throw new Error(`Connector ${connectorType} not found`);
    }
    connector.disconnect();
  }, [connector, connectorType]);

  const isOwned = useCallback(
    (lock: Script) => {
      if (!connector) {
        throw new Error(`Connector ${connectorType} not found`);
      }
      return connector.isOwned(lock);
    },
    [connector, connectorType],
  );

  const getAnyoneCanPayLock = useCallback(() => {
    if (!connector) {
      throw new Error(`Connector ${connectorType} not found`);
    }
    const lock = connector.getAnyoneCanPayLock();
    return lock;
  }, [connector, connectorType]);

  const signTransaction = useCallback(
    async (
      txSkeleton: helpers.TransactionSkeletonType,
    ): Promise<Transaction> => {
      if (!connector) {
        throw new Error(`Connector ${connectorType} not found`);
      }
      const transaction = await connector.signTransaction(txSkeleton);
      return transaction;
    },
    [connector, connectorType],
  );

  return {
    address,
    connected,
    lock,
    connect,
    disconnect,
    isOwned,
    getAnyoneCanPayLock,
    signTransaction,
  };
};
