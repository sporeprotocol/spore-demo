import {
  connect,
  watchAccount,
  disconnect,
  signMessage,
  configureChains,
  mainnet,
  createConfig,
} from '@wagmi/core';
import { publicProvider } from '@wagmi/core/providers/public';
import { bytes, number } from '@ckb-lumos/codec';
import { blockchain } from '@ckb-lumos/base';
import { InjectedConnector } from '@wagmi/core/connectors/injected';
import CKBConnector from './base';
import { Script, Transaction, commons, config, helpers } from '@ckb-lumos/lumos';
import { defaultWalletValue } from '@/state/wallet';

export default class MetaMaskConnector extends CKBConnector {
  public type = 'MetaMask';
  private listeners: Array<() => void> = [];
  public config: any;

  constructor() {
    super();
    const { publicClient, webSocketPublicClient } = configureChains(
      [mainnet],
      [publicProvider()],
    );
    this.config = createConfig({
      autoConnect: true,
      publicClient,
      webSocketPublicClient,
    });
  }

  private setAddress(account: `0x${string}` | undefined) {
    if (!account) {
      this.setData(defaultWalletValue);
      return;
    }
    config.initializeConfig(config.predefined.AGGRON4);
    const lock = commons.omnilock.createOmnilockScript({
      auth: { flag: 'ETHEREUM', content: account ?? '0x' },
    });
    const address = helpers.encodeToAddress(lock);
    this.setData({
      address,
      connectorType: this.type.toLowerCase(),
    });
  }

  public async connect() {
    const { account } = await connect({ connector: new InjectedConnector() });
    this.setAddress(account);
    this.isConnected = true;
    this.listeners.push(
      watchAccount((account) => {
        if (account.isConnected) {
          this.setAddress(account.address);
        }
        if (account.isDisconnected) {
          this.setAddress(undefined);
        }
      }),
    );
  }

  public async disconnect(): Promise<void> {
    await disconnect();
    this.listeners.forEach((unlisten) => unlisten());
  }

  public getAnyoneCanPayLock(minimalCkb = 0, minimalUdt = 0): Script {
    const { address } = this.getData();
    config.initializeConfig(config.predefined.AGGRON4);
    const lock = helpers.parseAddress(address);

    const ckb = bytes.hexify(number.Uint8.pack(minimalCkb)).slice(2);
    const udt = bytes.hexify(number.Uint8.pack(minimalUdt)).slice(2);
    const args = `02${ckb}${udt}`;
    lock.args = lock.args.slice(0, 44) + args;
    return lock;
  }

  public async signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction> {
    config.initializeConfig(config.predefined.AGGRON4);

    let tx = commons.omnilock.prepareSigningEntries(txSkeleton);
    const { message, index } = tx.signingEntries.get(0)!;
    let signature = await signMessage({
      message: { raw: message } as any,
    });

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

    tx = tx.update('witnesses', (witnesses) => {
      return witnesses.set(index, signedWitness);
    });

    const signedTx = helpers.createTransactionFromSkeleton(tx);
    return signedTx;
  }
}
