import { RPC, Transaction } from '@ckb-lumos/lumos';
import { sporeConfig } from "@/config";
import { OutPoint } from '@ckb-lumos/base/lib/blockchain';

export async function sendTransaction(tx: Transaction) {
  const rpc = new RPC(sporeConfig.ckbNodeUrl);
  const hash = await rpc.sendTransaction(tx, 'passthrough');
  await waitForTranscation(hash);
  return hash;
}

export async function waitForTranscation(txHash: string) {
  const rpc = new RPC(sporeConfig.ckbNodeUrl);
  
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
