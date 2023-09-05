import {
  Cell,
  CellCollector,
  CellProvider,
  HashType,
  QueryOptions,
  blockchain,
  values,
} from '@ckb-lumos/base';
import { LockScriptInfo } from '@ckb-lumos/common-scripts';
import {
  Options,
  TransactionSkeletonType,
  createTransactionFromSkeleton,
} from '@ckb-lumos/helpers';
import { commons, helpers, config as lumosConfig } from '@ckb-lumos/lumos';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import { addCellDep, hashWitness } from '@ckb-lumos/common-scripts/lib/helper';
import { bytes } from '@ckb-lumos/codec';
import { isSameScript } from '@/utils/script';
import { CKBHasher, ckbHash } from '@ckb-lumos/base/lib/utils';

const JOY_ID_SCRIPT: ScriptConfig = {
  CODE_HASH:
    '0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac',
  HASH_TYPE: 'type',
  TX_HASH: '0x437d4343c1eb5901c74ba34f6e9b1a1a25d72b441659d73bb1b40e9924bda6fb',
  INDEX: '0x0',
  DEP_TYPE: 'depGroup',
};

export const config = lumosConfig.createConfig({
  ...lumosConfig.predefined.AGGRON4,
  SCRIPTS: {
    ...lumosConfig.predefined.AGGRON4.SCRIPTS,
    JOY_ID: JOY_ID_SCRIPT,
  },
});

lumosConfig.initializeConfig(config);

export const setupInputCell = async (
  txSkeleton: TransactionSkeletonType,
  inputCell: Cell,
  _fromInfo: commons.FromInfo,
  { config, since, defaultWitness } = {},
): Promise<TransactionSkeletonType> => {
  const fromScript = inputCell.cellOutput.lock;
  const txMutable = txSkeleton.asMutable();

  txMutable.update('inputs', (inputs) => inputs.push(inputCell));

  const outputCell = {
    cellOutput: {
      ...inputCell.cellOutput,
    },
    data: inputCell.data,
  };
  txMutable.update('outputs', (outputs) => outputs.push(outputCell));

  if (since) {
    txMutable.setIn(['inputSinces', txMutable.get('inputs').size - 1], since);
  }

  txMutable.update('witnesses', (witnesses) =>
    witnesses.push(defaultWitness ?? '0x'),
  );

  const scriptOutPoint = {
    txHash: JOY_ID_SCRIPT.TX_HASH,
    index: JOY_ID_SCRIPT.INDEX,
  };
  // The helper method addCellDep avoids adding duplicated cell deps.
  addCellDep(txMutable, {
    outPoint: scriptOutPoint,
    depType: JOY_ID_SCRIPT.DEP_TYPE,
  });

  const firstIndex = txMutable
    .get('inputs')
    .findIndex((input: Cell) =>
      isSameScript(input.cellOutput.lock, fromScript),
    );

  if (firstIndex !== -1) {
    // Ensure witnesses are aligned to inputs
    const toFillWitnessesCount =
      firstIndex + 1 - txMutable.get('witnesses').size;
    if (toFillWitnessesCount > 0) {
      txMutable.update('witnesses', (witnesses) =>
        witnesses.concat(Array(toFillWitnessesCount).fill('0x')),
      );
    }
    txMutable.updateIn(['witnesses', firstIndex], (witness: any) => {
      const witnessArgs = {
        ...(witness === '0x'
          ? {}
          : blockchain.WitnessArgs.unpack(bytes.bytify(witness))),
        lock: '0x0000000000000000',
      };
      return bytes.hexify(blockchain.WitnessArgs.pack(witnessArgs));
    });
  }

  console.log(
    'setupInputCell',
    helpers.createTransactionFromSkeleton(txMutable),
  );
  return txMutable.asImmutable();
};

export const prepareSigningEntries = (
  txSkeleton: TransactionSkeletonType,
): TransactionSkeletonType => {
  let processedArgs = new Set<string>();
  const tx = createTransactionFromSkeleton(txSkeleton);
  const txHash = ckbHash(blockchain.RawTransaction.pack(tx));
  const inputs = txSkeleton.get('inputs');
  const witnesses = txSkeleton.get('witnesses');
  let signingEntries = txSkeleton.get('signingEntries');
  for (let i = 0; i < inputs.size; i++) {
    const input = inputs.get(i)!;
    if (
      JOY_ID_SCRIPT.CODE_HASH === input.cellOutput.lock.codeHash &&
      JOY_ID_SCRIPT.HASH_TYPE === input.cellOutput.lock.hashType &&
      !processedArgs.has(input.cellOutput.lock.args)
    ) {
      processedArgs = processedArgs.add(input.cellOutput.lock.args);
      const lockValue = new values.ScriptValue(input.cellOutput.lock, {
        validate: false,
      });
      const hasher = new CKBHasher();
      hasher.update(txHash);
      if (i >= witnesses.size) {
        throw new Error(
          `The first witness in the script group starting at input index ${i} does not exist, maybe some other part has invalidly tampered the transaction?`,
        );
      }
      hashWitness(hasher, witnesses.get(i)!);
      for (let j = i + 1; j < inputs.size && j < witnesses.size; j++) {
        const otherInput = inputs.get(j)!;
        if (
          lockValue.equals(
            new values.ScriptValue(otherInput.cellOutput.lock, {
              validate: false,
            }),
          )
        ) {
          hashWitness(hasher, witnesses.get(j)!);
        }
      }
      for (let j = inputs.size; j < witnesses.size; j++) {
        hashWitness(hasher, witnesses.get(j)!);
      }
      const signingEntry = {
        type: 'witness_args_lock',
        index: i,
        message: hasher.digestHex(),
      };
      signingEntries = signingEntries.push(signingEntry);
    }
  }
  console.log(signingEntries.map(signingEntry => signingEntry));
  txSkeleton = txSkeleton.set('signingEntries', signingEntries);
  return txSkeleton;
};

const lockScriptInfo: LockScriptInfo = {
  codeHash: JOY_ID_SCRIPT.CODE_HASH,
  hashType: JOY_ID_SCRIPT.HASH_TYPE,
  lockScriptInfo: {
    CellCollector: class {
      cellCollector: CellCollector;
      fromScript = {
        codeHash: '0x',
        hashType: 'type' as HashType,
        args: '0x',
      };

      constructor(
        fromInfo: commons.FromInfo,
        cellProvider: CellProvider,
        { config, queryOptions }: Options & { queryOptions?: QueryOptions },
      ) {
        if (!cellProvider) {
          throw new Error(`Cell provider is missing!`);
        }
        config ??= lumosConfig.getConfig();
        const script = commons.parseFromInfo(fromInfo, { config }).fromScript;

        queryOptions ??= {};
        queryOptions = {
          ...queryOptions,
          lock: script,
          type: queryOptions.type ?? 'empty',
        };

        this.cellCollector = cellProvider.collector(queryOptions);
      }

      async *collect() {
        if (this.cellCollector) {
          for await (const inputCell of this.cellCollector.collect()) {
            yield inputCell;
          }
        }
      }
    },
    setupInputCell,
    prepareSigningEntries,
  },
};

export default lockScriptInfo;
