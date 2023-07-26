import { RPC, commons, config, helpers } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';
import { useCallback, useMemo } from 'react';
import { useSignMessage } from 'wagmi';
import { predefinedSporeConfigs } from '@spore-sdk/core';

export default function useSendTransaction() {
  const { signMessageAsync } = useSignMessage();
  const rpc = useMemo(
    () => new RPC(predefinedSporeConfigs.Aggron4.ckbNodeUrl),
    [],
  );

  const sendTransaction = useCallback(
    async (txSkeleton: helpers.TransactionSkeletonType) => {
      txSkeleton = commons.omnilock.prepareSigningEntries(txSkeleton, {
        config: config.predefined.AGGRON4,
      });
      const { message } = txSkeleton.signingEntries.get(0)!;
      // TODO: remove raw message type until wagmi fix it
      let signature = await signMessageAsync({ message: { raw: message } as any });

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

      txSkeleton = txSkeleton.update('witnesses', (witnesses) =>
        witnesses.set(0, signedWitness),
      );

      const tx = helpers.createTransactionFromSkeleton(txSkeleton, { validate: true });
      const hash = await rpc.sendTransaction(tx, 'passthrough');
      return hash;
    },
    [signMessageAsync, rpc],
  );

  return {
    sendTransaction,
  };
}

