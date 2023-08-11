import { commons, config, helpers } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';
import { useCallback, useEffect } from 'react';
import {
  useAccount as useWagmiAccount,
  useConnect as useWagmiConnect,
} from 'wagmi';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { useWalletStore } from './useWalletConnect';
import { signMessage } from 'wagmi/actions';

function toCKBAddress(address: `0x${string}`) {
  config.initializeConfig(config.predefined.AGGRON4);
  const lock = commons.omnilock.createOmnilockScript({
    auth: { flag: 'ETHEREUM', content: address ?? '0x' },
  });
  return helpers.encodeToAddress(lock);
}

export default function useMetaMask() {
  const { address, connected, connectorType, update } = useWalletStore();
  const { connect: connectMetaMask } = useWagmiConnect({
    connector: new MetaMaskConnector(),
  });
  const { address: ethAddress, isConnected } = useWagmiAccount({
    onConnect: (opts) => {
      update({
        address: toCKBAddress(opts.address!),
        connectorType: 'metamask',
      });
    },
    onDisconnect: () => {
      update({
        address: '',
        connectorType: 'metamask',
      });
    },
  });

  useEffect(() => {
    if (connectorType === 'metamask' && connected && !isConnected) {
      connectMetaMask();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, connectorType]);

  useEffect(() => {
    if (connectorType === 'metamask' && isConnected && ethAddress) {
      const addr = toCKBAddress(ethAddress);
      if (addr !== address) {
        update({
          address: addr,
        });
      }
    }
  }, [address, connectorType, ethAddress, isConnected, update]);

  const connect = useCallback(() => {
    connectMetaMask();
  }, [connectMetaMask]);

  const signTransaction = useCallback(
    async (txSkeleton: helpers.TransactionSkeletonType) => {
      config.initializeConfig(config.predefined.AGGRON4);

      let tx = commons.omnilock.prepareSigningEntries(txSkeleton);
      const { message, index } = tx.signingEntries.get(0)!;
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

      tx = tx.update('witnesses', (witnesses) => {
        return witnesses.set(index, signedWitness);
      });

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
