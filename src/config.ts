import { forkSporeConfig, predefinedSporeConfigs, setSporeConfig, SporeConfig } from '@spore-sdk/core';

const sporeConfig: SporeConfig = forkSporeConfig(predefinedSporeConfigs.Aggron4, {
  lumos: {
    PREFIX: 'ckt',
    SCRIPTS: {
      ...predefinedSporeConfigs.Aggron4.lumos.SCRIPTS,
      OMNILOCK: {
        ...predefinedSporeConfigs.Aggron4.lumos.SCRIPTS.OMNILOCK!,
        TX_HASH: '0x3d4296df1bd2cc2bd3f483f61ab7ebeac462a2f336f2b944168fe6ba5d81c014',
        INDEX: '0x0',
      },
    },
  },
});

setSporeConfig(sporeConfig);

export {
  sporeConfig,
};
