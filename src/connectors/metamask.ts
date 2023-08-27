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
import {
  BI,
  Script,
  Transaction,
  commons,
  config,
  helpers,
} from '@ckb-lumos/lumos';
import { defaultWalletValue } from '@/state/wallet';
import { common } from '@ckb-lumos/common-scripts';
import {
  getAnyoneCanPayMinimumCapacity,
  isAnyoneCanPay,
  isSameScript,
} from '@/utils/script';

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
    this.isConnected = false;
  }

  public getAnyoneCanPayLock(minimalCkb = 0, minimalUdt = 0): Script {
    const lock = this.getLockFromAddress();
    const ckb = bytes.hexify(number.Uint8.pack(minimalCkb)).slice(2);
    const udt = bytes.hexify(number.Uint8.pack(minimalUdt)).slice(2);
    const args = `02${ckb}${udt}`;
    lock.args = lock.args.slice(0, 44) + args;
    return lock;
  }

  public isOwned(targetLock: Script): boolean {
    const lock = this.getLockFromAddress();
    return (
      lock.codeHash === targetLock.codeHash &&
      lock.hashType === targetLock.hashType &&
      // same omnilock auth args
      // https://blog.cryptape.com/omnilock-a-universal-lock-that-powers-interoperability-1#heading-authentication
      lock.args.slice(0, 44) === targetLock.args.slice(0, 44)
    );
  }

  public async signTransaction(
    txSkeleton: helpers.TransactionSkeletonType,
  ): Promise<Transaction> {
    config.initializeConfig(config.predefined.AGGRON4);
    const inputs = txSkeleton.get('inputs')!;
    const outputs = txSkeleton.get('outputs')!;

    // add anyone-can-pay minimal capacity in outputs
    // https://github.com/nervosnetwork/rfcs/blob/master/rfcs/0042-omnilock/0042-omnilock.md#anyone-can-pay-mode
    outputs.forEach((output, index) => {
      const { lock } = output.cellOutput;
      if (
        isAnyoneCanPay(lock) &&
        inputs.some((i) => isSameScript(i.cellOutput.lock, lock))
      ) {
        const minimalCapacity = getAnyoneCanPayMinimumCapacity(lock);
        txSkeleton = txSkeleton.update('outputs', (outputs) => {
          output.cellOutput.capacity = BI.from(output.cellOutput.capacity)
            .add(minimalCapacity)
            .toHexString();
          return outputs.set(index, output);
        });
      }
    });

    // remove anyone-can-pay witness when cell lock not changed
    inputs.forEach((input, index) => {
      const { lock } = input.cellOutput;
      if (
        isAnyoneCanPay(lock) &&
        outputs.some((o) => isSameScript(o.cellOutput.lock, lock))
      ) {
        txSkeleton = txSkeleton.update('witnesses', (witnesses) => {
          return witnesses.set(index, '0x');
        });
      }
    });

    let tx = common.prepareSigningEntries(txSkeleton, {
      config: config.predefined.AGGRON4,
    });
    const signedWitnesses = new Map<string, string>();
    const signingEntries = tx.get('signingEntries')!;
    for (let i = 0; i < signingEntries.size; i += 1) {
      const entry = signingEntries.get(i)!;
      if (entry.type === 'witness_args_lock') {
        const {
          cellOutput: { lock },
        } = inputs.get(entry.index)!;
        // skip anyone-can-pay witness when cell lock not changed
        if (
          !isSameScript(lock, this.lock!) &&
          outputs.some((o) => isSameScript(o.cellOutput.lock, lock))
        ) {
          continue;
        }

        const { message, index } = entry;
        if (signedWitnesses.has(message)) {
          const signedWitness = signedWitnesses.get(message)!;
          tx = tx.update('witnesses', (witnesses) => {
            return witnesses.set(index, signedWitness);
          });
          continue;
        }

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
        signedWitnesses.set(message, signedWitness);

        tx = tx.update('witnesses', (witnesses) => {
          return witnesses.set(index, signedWitness);
        });
      }
    }

    const signedTx = helpers.createTransactionFromSkeleton(tx);
    return signedTx;
  }
}
