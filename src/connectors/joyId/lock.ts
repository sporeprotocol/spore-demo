import {
  Cell,
  CellCollector,
  CellProvider,
  HashType,
  QueryOptions,
  blockchain,
} from '@ckb-lumos/base';
import { LockScriptInfo } from '@ckb-lumos/common-scripts';
import { Options, TransactionSkeletonType } from '@ckb-lumos/helpers';
import { commons, config as lumosConfig } from '@ckb-lumos/lumos';
import { ScriptConfig } from '@ckb-lumos/config-manager';
import { addCellDep } from '@ckb-lumos/common-scripts/lib/helper';
import { bytes } from '@ckb-lumos/codec';
import { isSameScript } from '@/utils/script';

const JOY_ID_SCRIPT: ScriptConfig = {
  CODE_HASH:
    '0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac',
  HASH_TYPE: 'type',
  TX_HASH: '0x437d4343c1eb5901c74ba34f6e9b1a1a25d72b441659d73bb1b40e9924bda6fb',
  INDEX: '0x0',
  DEP_TYPE: 'depGroup',
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
    setupInputCell: async (
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
        txMutable.setIn(
          ['inputSinces', txMutable.get('inputs').size - 1],
          since,
        );
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

      console.log('setupInputCell', txMutable.toJS());
      return txMutable.asImmutable();
    },
    prepareSigningEntries: function (
      txSkeleton: TransactionSkeletonType,
      options: Options,
    ): TransactionSkeletonType {
      console.log('prepareSigningEntries', txSkeleton);
      return txSkeleton;
    },
  },
};

export default lockScriptInfo;
