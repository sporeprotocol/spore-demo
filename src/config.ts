import { predefinedSporeConfigs, SporeConfig } from '@spore-sdk/core';
import { predefined } from "@ckb-lumos/config-manager";

export const sporeConfig: SporeConfig = {
  ...predefinedSporeConfigs.Aggron4,
  lumos: {
    ...predefined.AGGRON4,
    SCRIPTS: {
      ...predefined.AGGRON4.SCRIPTS,
      OMNILOCK: {
        CODE_HASH:
          "0xf329effd1c475a2978453c8600e1eaf0bc2087ee093c3ee64cc96ec6847752cb",
        HASH_TYPE: "type",
        TX_HASH:
          "0xb50ef6f2e9138f4dbca7d5280e10d29c1a65e60e8a574c009a2fa4e4107e0750",
        INDEX: "0x0",
        DEP_TYPE: "code",
      },
    },
  },
};
