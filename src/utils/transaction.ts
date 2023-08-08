import { RPC, Transaction } from '@ckb-lumos/lumos';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { Network } from './network';

export async function sendTransaction(
  tx: Transaction,
  network: Network = 'Aggron4',
) {
  const rpc = new RPC(predefinedSporeConfigs[network].ckbNodeUrl);
  const hash = await rpc.sendTransaction(tx, 'passthrough');
  await waitForTranscation(hash);
  return hash;
}

export async function waitForTranscation(
  txHash: string,
  network: Network = 'Aggron4',
) {
  const rpc = new RPC(predefinedSporeConfigs[network].ckbNodeUrl);
  return new Promise(async (resolve) => {
    const transaction = await rpc.getTransaction(txHash);
    const { status } = transaction.txStatus;
    if (status === 'committed') {
      resolve(txHash);
    } else {
      setTimeout(() => {
        resolve(waitForTranscation(txHash));
      }, 1000);
    }
  });
}
