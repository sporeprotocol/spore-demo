import { predefinedSporeConfigs } from "@spore-sdk/core";
import { Network } from "./network";

type ScriptName = keyof typeof predefinedSporeConfigs[Network]['lumos']['SCRIPTS']

export function getScript(name: ScriptName, network: Network = 'Aggron4') {
  const script = predefinedSporeConfigs[network].lumos.SCRIPTS[name];
  if (!script) {
    throw new Error(`Script ${name} not found in network ${network}`);
  }
  return script;
}
