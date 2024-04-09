import { sporeConfig } from '@/config';
import { config, helpers } from '@ckb-lumos/lumos';

export function isValidAddress(address: string) {
  try {
    const lock = helpers.parseAddress(address, {
      config: sporeConfig.lumos
    });
    return !!lock;
  } catch (e) {
    return false;
  }
}
