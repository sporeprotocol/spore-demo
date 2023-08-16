import { bytes } from '@ckb-lumos/codec';
import { Script, blockchain } from '@ckb-lumos/base';
import { TransactionSkeletonType } from '@ckb-lumos/helpers';
import { Transaction, helpers } from '@ckb-lumos/lumos';
// @ts-ignore
import { initConfig, connect, signChallenge } from '@joyid/ckb';
// @ts-ignore
import { verifyCredential } from '@joyid/core';
import CKBConnector from './base';
import { defaultWalletValue, walletAtom } from '@/state/wallet';
import { common } from '@ckb-lumos/common-scripts';

const JOY_ID_URL = 'https://app.joyid.dev';
const JOY_ID_SERVER_URL = 'https://api.joyid.dev';

export default class JoyIdConnector extends CKBConnector {
  public type: string = 'JoyID';

  constructor() {
    super();

    initConfig({
      name: 'Spore Demo',
      joyidAppURL: JOY_ID_URL,
      joyidServerURL: JOY_ID_SERVER_URL,
    });
  }

  async connect(): Promise<void> {
    const authData = await connect();
    const { address } = authData;
    this.store.set(walletAtom, {
      address,
      connectorType: this.type.toLowerCase(),
      data: authData,
    });
    this.isConnected = true;
  }

  disconnect(): Promise<void> | void {
    this.store.set(walletAtom, defaultWalletValue);
  }

  getAnyoneCanPayLock(): Script {
    throw new Error('Method not implemented.');
  }

  async signTransaction(
    txSkeleton: TransactionSkeletonType,
  ): Promise<Transaction> {
    const { data } = this.store.get(walletAtom);
    const { keyType, address, pubkey, alg } = data;
    if (keyType === 'main_session_key' || keyType === 'sub_session_key') {
      const isValid = await verifyCredential(pubkey, address, keyType, alg);
      if (!isValid) {
        throw new Error(
          'Your key is expired, please re-authenticate with JoyID',
        );
      }
    }

    let tx = common.prepareSigningEntries(txSkeleton);
    const signingEntries = txSkeleton.get('signingEntries');
    const witnesses = txSkeleton.get('witnesses');

    const { message, index } = signingEntries.get(0)!;
    const { signature } = await signChallenge(message, address);
    const witness = witnesses.get(index)!;
    const signedWitness = bytes.hexify(
      blockchain.WitnessArgs.pack({
        ...blockchain.WitnessArgs.unpack(witness),
        lock: signature,
      }),
    );
    tx = tx.update('witnesses', (witnesses) => {
      return witnesses.set(index, signedWitness);
    });

    const signedTx = helpers.createTransactionFromSkeleton(tx);
    return signedTx;
  }
}
