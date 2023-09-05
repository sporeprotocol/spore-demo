import { Script } from '@ckb-lumos/base';
import { Transaction, commons, config, helpers } from '@ckb-lumos/lumos';
// @ts-ignore
import { initConfig, connect, signMessage } from '@joyid/evm';
// @ts-ignore
import CKBConnector from './base';
import { defaultWalletValue, walletAtom } from '@/state/wallet';
import * as omnilock from './lock/omnilock';

export default class JoyIdConnector extends CKBConnector {
  public type: string = 'JoyID';

  constructor() {
    super();

    initConfig({
      name: 'Spore Demo',
    });
  }

  private setAddress(ethAddress: `0x${string}` | undefined) {
    if (!ethAddress) {
      this.setData(defaultWalletValue);
      return;
    }
    config.initializeConfig(config.predefined.AGGRON4);
    const lock = commons.omnilock.createOmnilockScript({
      auth: { flag: 'ETHEREUM', content: ethAddress ?? '0x' },
    });
    const address = helpers.encodeToAddress(lock, {
      config: config.predefined.AGGRON4,
    });
    this.setData({
      address,
      connectorType: this.type.toLowerCase(),
      data: ethAddress,
    });
  }

  public async connect(): Promise<void> {
    try {
      const ethAddress = await connect();
      this.setAddress(ethAddress);
      this.isConnected = true;
    } catch (e) {
      console.log(e);
    }
  }

  public async disconnect(): Promise<void> {
    this.store.set(walletAtom, defaultWalletValue);
    this.isConnected = false;
  }

  public getAnyoneCanPayLock(minimalCkb = 0, minimalUdt = 0): Script {
    const lock = this.getLockFromAddress();
    return omnilock.getAnyoneCanPayLock(lock, minimalCkb, minimalUdt);
  }

  public isOwned(targetLock: Script): boolean {
    const lock = this.getLockFromAddress();
    return omnilock.isOwned(lock, targetLock);
  }

  public async signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction> {
    const { data: ethAddress } = this.getData();
    const transaction = await omnilock.signTransaction(
      txSkeleton,
      this.lock!,
      (message) => signMessage(message, ethAddress),
    );
    return transaction;
  }
}
