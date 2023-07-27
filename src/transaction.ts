import { RPC, commons, config, helpers } from '@ckb-lumos/lumos';
import { bytes } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';
import { signMessage } from 'wagmi/actions';
import { predefinedSporeConfigs } from '@spore-sdk/core';

export async function sendTransaction(
  txSkeleton: helpers.TransactionSkeletonType,
) {
  config.initializeConfig(config.predefined.AGGRON4);
  const rpc = new RPC(predefinedSporeConfigs.Aggron4.ckbNodeUrl);

  let tx = commons.omnilock.prepareSigningEntries(txSkeleton);
  const { message } = tx.signingEntries.get(0)!;
  // TODO: remove raw message type until wagmi fix it
  let signature = await signMessage({ message: { raw: message } as any });

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
  const hash = await rpc.sendTransaction(signedTx, 'passthrough');
  return hash;
}
