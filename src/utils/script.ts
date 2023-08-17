import { predefinedSporeConfigs } from '@spore-sdk/core';
import { BI, Script } from '@ckb-lumos/lumos';

type ScriptName =
  keyof (typeof predefinedSporeConfigs)['Aggron4']['lumos']['SCRIPTS'];

export function getScriptConfig(name: ScriptName) {
  const script = predefinedSporeConfigs.Aggron4.lumos.SCRIPTS[name];
  if (!script) {
    throw new Error(`Script ${name} not found`);
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

export function getOmnilockAnyoneCanPayModeLock(lock: Script) {
  if (!isOmnilockScript(lock)) {
    throw new Error('Invalid omnilock script');
  }
  const args = lock.args.slice(0, 44) + '020000';
  return {
    codeHash: lock.codeHash,
    hashType: lock.hashType,
    args,
  };
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
