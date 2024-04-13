import { Script } from '@ckb-lumos/base';
import { BI, Transaction, commons, config, helpers } from '@ckb-lumos/lumos';
// @ts-ignore
import { initConfig, connect, signMessage, signRawTransaction } from '@joyid/ckb';
// @ts-ignore
import CKBConnector from './base';
import { defaultWalletValue, walletAtom } from '@/state/wallet';
import * as omnilock from './lock/omnilock';
import { isSameScript } from '@/utils/script';
import { bytes } from '@ckb-lumos/codec';
import { createTransactionFromSkeleton } from '@ckb-lumos/lumos/helpers';
import { registerCustomLockScriptInfos } from '@ckb-lumos/common-scripts/lib/common';
import { createJoyIDScriptInfo } from '@/utils/joyid';

export default class JoyIdConnector extends CKBConnector {
  public type: string = 'JoyID';
  public icon = '/images/joyid-icon.png';

  constructor() {
    super();

    initConfig({
      name: 'Spore Demo',
      joyidAppURL: 'https://testnet.joyid.dev',
    });
    this.enabled = true;
  }

  private setAddress(address: string | undefined) {
    if (!address) {
      this.setData(defaultWalletValue);
      return;
    }
    // config.initializeConfig(config.predefined.AGGRON4);
    this.setData({
      address,
      connectorType: this.type.toLowerCase(),
      data: address,
    });
  }

  public async connect(): Promise<void> {
    registerCustomLockScriptInfos([createJoyIDScriptInfo()]);
    const { address, connectorType } = this.getData();
    if (connectorType === this.type.toLowerCase() && address) {
      return;
    }
    const AuthData = await connect();
    this.setAddress(AuthData.address);
    this.isConnected = true;
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
    const { address, connectorType } = this.getData();
    let tx = createTransactionFromSkeleton(txSkeleton);
    //@ts-ignore
    let signTx = await signRawTransaction(tx, address);
    return signTx
  }
}
