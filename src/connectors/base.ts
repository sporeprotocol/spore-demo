import store from '@/state/store';
import { WalletData, walletAtom } from '@/state/wallet';
import { Script, Transaction, helpers } from '@ckb-lumos/lumos';

export default abstract class CKBConnector {
  public isConnected = false;
  protected store = store;
  abstract type: string;

  protected setData(data: WalletData) {
    this.store.set(walletAtom, data);
  }

  protected getData(): WalletData {
    return this.store.get(walletAtom);
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void> | void;
  abstract getAnyoneCanPayLock(): Script;
  abstract signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction>;
}
