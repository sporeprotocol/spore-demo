import { commons, config, helpers } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';
import { useMemo, useCallback, useEffect } from 'react';
import {
  useAccount as useWagmiAccount,
  useConnect as useWagmiConnect,
  useDisconnect as useWagmiDisconnect,
} from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { useWalletStore } from './useWalletConnect';
import { signMessage } from 'wagmi/actions';

export default function useMetaMask() {
  const { update } = useWalletStore();
  const { connect: connectMetaMask } = useWagmiConnect({
    connector: new MetaMaskConnector(),
  });
  const { address: ethAddress, isConnected } = useWagmiAccount();

  useWagmiDisconnect({
    onSuccess: () => {
      update({
        address: '',
        connected: false,
        connectorType: 'metamask',
      });
    }
  })

  const address = useMemo(() => {
    if (ethAddress) {
      config.initializeConfig(config.predefined.AGGRON4);
      const lock = commons.omnilock.createOmnilockScript({
        auth: { flag: 'ETHEREUM', content: ethAddress ?? '0x' },
      });
      return helpers.encodeToAddress(lock);
    }
    return '';
  }, [ethAddress]);

  useEffect(() => {
    const connected = localStorage.getItem('wagmi.connected');
    if (connected && !isConnected) {
      connectMetaMask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isConnected) {
      update({
        address,
        connected: isConnected,
        connectorType: 'metamask',
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected]);

  const connect = useCallback(() => {
    connectMetaMask();
    update({
      address,
      connected: isConnected,
      connectorType: 'metamask',
    });
  }, [address, connectMetaMask, isConnected, update]);

  const signTransaction = useCallback(
    async (txSkeleton: helpers.TransactionSkeletonType) => {
      config.initializeConfig(config.predefined.AGGRON4);

      let tx = commons.omnilock.prepareSigningEntries(txSkeleton);
      const { message } = tx.signingEntries.get(0)!;
      // TODO: remove raw message type until wagmi fix it
      let signature = await signMessage({
        message: { raw: message } as any,
      });

      // Fix ECDSA recoveryId v parameter
      // https://bitcoin.stackexchange.com/questions/38351/ecdsa-v-r-s-what-is-v
      let v = Number.parseInt(signature.slice(-2), 16);
      if (v >= 27) v -= 27;
      signature = ('0x' +
        signature.slice(2, -2) +
        v.toString(16).padStart(2, '0')) as `0x${string}`;

      const signedWitness = bytes.hexify(
        blockchain.WitnessArgs.pack({
          lock: commons.omnilock.OmnilockWitnessLock.pack({
            signature: bytes.bytify(signature!).buffer,
          }),
        }),
      );

      tx = tx.update('witnesses', (witnesses) =>
        witnesses.set(0, signedWitness),
      );

      const signedTx = helpers.createTransactionFromSkeleton(tx);
      return signedTx;
    },
    [],
  );

  return {
    connect,
    signTransaction,
  };
}
