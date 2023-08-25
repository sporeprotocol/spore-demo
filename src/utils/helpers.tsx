import { config, helpers } from '@ckb-lumos/lumos';

export function isValidAddress(address: string) {
  try {
    const lock = helpers.parseAddress(address, {
      config: config.predefined.AGGRON4,
    });
    return !!lock;
  } catch (e) {
    return false;
  }
}
