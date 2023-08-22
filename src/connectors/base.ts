import store from '@/state/store';
import { WalletData, walletAtom } from '@/state/wallet';
import { Script, Transaction, config, helpers } from '@ckb-lumos/lumos';

export default abstract class CKBConnector {
  public isConnected: boolean = false;
  public enable: boolean = true;

  protected store = store;
  abstract type: string;

  public get lock(): Script | undefined {
    const { address } = this.getData();
    if (!address) {
      return undefined;
    }
    return helpers.parseAddress(address, {
      config: config.predefined.AGGRON4,
    });
  }

  protected setData(data: WalletData) {
    this.store.set(walletAtom, data);
  }

  protected getData(): WalletData {
    return this.store.get(walletAtom);
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void> | void;
  abstract getAnyoneCanPayLock(): Script;
  abstract isOwned(targetLock: Script): boolean;
  abstract signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction>;
}
