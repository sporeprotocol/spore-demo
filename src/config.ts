import { predefinedSporeConfigs, setSporeConfig, SporeConfig } from '@spore-sdk/core';

const sporeConfig: SporeConfig = predefinedSporeConfigs.Aggron4;

setSporeConfig(sporeConfig);

export {
  sporeConfig,
};
