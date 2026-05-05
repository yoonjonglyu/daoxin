import { useAtom } from "jotai";

import { ConfigAtom } from "../store/config";

import type { Config } from "../types/config";

const useConfig = () => {
  const [config, setConfig] = useAtom(ConfigAtom);
  
  const updateConfig = (newConfig: Partial<Config>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }
  const initialized = () => {
    if (!config.initialized) {
      updateConfig({ initialized: true });
    }
  }

  return { config, updateConfig, initialized };
};

export default useConfig;