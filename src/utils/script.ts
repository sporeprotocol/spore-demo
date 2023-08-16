import { predefinedSporeConfigs } from '@spore-sdk/core';
import { Network } from './network';
import { BI, Script } from '@ckb-lumos/lumos';

type ScriptName =
  keyof (typeof predefinedSporeConfigs)[Network]['lumos']['SCRIPTS'];

export function getScriptConfig(
  name: ScriptName,
  network: Network = 'Aggron4',
) {
  const script = predefinedSporeConfigs[network].lumos.SCRIPTS[name];
  if (!script) {
    throw new Error(`Script ${name} not found in network ${network}`);
  }
  return script;
}

export function isAnyoneCanPayScript(script: Script) {
  const anyoneCanPayLockScript = getScriptConfig('ANYONE_CAN_PAY');
  return (
    script.codeHash === anyoneCanPayLockScript.CODE_HASH &&
    script.hashType === anyoneCanPayLockScript.HASH_TYPE
  );
}

export function isOmnilockScript(script: Script) {
  const omnilockScript = getScriptConfig('OMNILOCK');
  return (
    script.codeHash === omnilockScript.CODE_HASH &&
    script.hashType === omnilockScript.HASH_TYPE
  );
}

export function isSameScript(
  script1: Script | undefined,
  script2: Script | undefined,
) {
  if (!script1 || !script2) {
    return false;
  }
  return (
    script1.codeHash === script2.codeHash &&
    script1.hashType === script2.hashType &&
    script1.args === script2.args
  );
}

export function isAnyoneCanPay(script: Script) {
  if (isOmnilockScript(script)) {
    return script.args.slice(44, 46) === '02';
  }

  return isAnyoneCanPayScript(script);
}

export function getAnyoneCanPayMinimumCapacity(script: Script) {
  if (!isAnyoneCanPay(script)) {
    return 0;
  }
  if (isOmnilockScript(script)) {
    const minimumCKB = BI.from(`0x${script.args.slice(46, 48)}`).toNumber();
    return 10 ** minimumCKB;
  }

  if (isAnyoneCanPayScript(script)) {
    const minimumCKB = BI.from(`0x${script.args.slice(46, 48)}`).toNumber();
    return 10 ** minimumCKB;
  }

  return 0;
}
