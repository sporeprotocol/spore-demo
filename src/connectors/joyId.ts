import { Script } from '@ckb-lumos/base';
import { BI, Transaction, commons, config, helpers } from '@ckb-lumos/lumos';
// @ts-ignore
import { initConfig, connect, signMessage } from '@joyid/evm';
// @ts-ignore
import CKBConnector from './base';
import { defaultWalletValue, walletAtom } from '@/state/wallet';
import * as omnilock from './lock/omnilock';
import { isSameScript } from '@/utils/script';
import { bytes } from '@ckb-lumos/codec';

export default class JoyIdConnector extends CKBConnector {
  public type: string = 'JoyID';
  public icon = '/images/joyid-icon.png';

  constructor() {
    super();

    initConfig({
      name: 'Spore Demo',
      joyidAppURL: 'https://testnet.joyid.dev',
    });
    this.enabled = false;
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
    const { address, connectorType } = this.getData();
    if (connectorType === this.type.toLowerCase() && address) {
      return;
    }
    const ethAddress = await connect();
    this.setAddress(ethAddress);
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
    const { data: ethAddress } = this.getData();

    const outputs = txSkeleton.get('outputs')!;
    outputs.forEach((output, index) => {
      const { lock, type } = output.cellOutput;

      if (!type && isSameScript(lock, this.lock)) {
        txSkeleton = txSkeleton.update('outputs', (outputs) => {
          output.cellOutput.capacity = BI.from(output.cellOutput.capacity)
            .sub(1000)
            .toHexString();
          return outputs.set(index, output);
        });
      }
    });

    const transaction = await omnilock.signTransaction(
      txSkeleton,
      this.lock!,
      async (message) => {
        return new Promise((resolve, reject) => {
          const button = document.createElement('button');
          button.onclick = async () => {
            try {
              const signature = await signMessage(bytes.bytify(message), ethAddress);
              resolve(signature);
            } catch (e) {
              reject(e);
            }
          };
          button.click();
        })
      },
    );
    return transaction;
  }
}
