import store from '@/state/store';
import { WalletData, walletAtom } from '@/state/wallet';
import { Script, Transaction, config, helpers } from '@ckb-lumos/lumos';

export default abstract class CKBConnector {
  private _isConnected: boolean = false;
  private _enable: boolean = true;
  protected store = store;
  abstract type: string;
  abstract icon: string;
  public visible: boolean = true;

  protected set isConnected(val: boolean) {
    this._isConnected = val;
  }

  public get isConnected() {
    return this._isConnected;
  }

  protected set enable(val: boolean) {
    this._enable = val;
  }

  public get enable() {
    return this._enable;
  }

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

  protected getLockFromAddress(): Script {
    const { address } = this.getData();
    return helpers.parseAddress(address, {
      config: config.predefined.AGGRON4,
    });
  }

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void> | void;
  abstract getAnyoneCanPayLock(): Script;
  abstract isOwned(targetLock: Script): boolean;
  abstract signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction>;
}
