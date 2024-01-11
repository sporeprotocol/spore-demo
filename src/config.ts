import { SporeConfig } from '@spore-sdk/core';
import { predefined } from "@ckb-lumos/config-manager";

export const sporeConfig: SporeConfig = {
  lumos: predefined.AGGRON4,
  ckbNodeUrl: 'https://testnet.ckb.dev/rpc',
  ckbIndexerUrl: 'https://testnet.ckb.dev/indexer',
  maxTransactionSize: 500 * 1024,
  scripts: {
    Spore: {
      script: {
        codeHash: '0x86973384d661ac5aabd581de082b04726d74705fa0f97602faf10089be0a0f85',
        hashType: 'data1',
      },
      cellDep: {
        outPoint: {
          txHash: '0x024b39f1e840548a5f4c915ced950a79dbd0c78954290e472c995eb83f72b7cf',
          index: '0x0',
        },
        depType: 'code',
      },
      versions: [],
    },
    Cluster: {
      script: {
        codeHash: '0x3df619d2d3b80b561394c57df504f3f13e1a1e3a0ea6f3f61ad2cc1da5af9911',
        hashType: 'data1',
      },
      cellDep: {
        outPoint: {
          txHash: '0x5382cd28be1da97b2e7f2824b68e3e5613441b489031eab7d1346fe4a0b9a0cf',
          index: '0x0',
        },
        depType: 'code',
      },
      versions: [],
    },
  },
  extensions: [],
};
