import store from '@/state/store';
import { Transaction, helpers } from '@ckb-lumos/lumos';

export default abstract class Connector {
  protected store = store;
  abstract type: string;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction>;
}
