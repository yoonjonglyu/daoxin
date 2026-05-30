import { useAtom } from "jotai";
import { ConfigAtom } from "../store/config";
import type { Config } from "../types/config";
import { saveEncryptedData, loadEncryptedData } from "../utils/storage";
import { CONFIG_STORAGE_KEY } from "../value";

const useConfig = () => {
  const [config, setConfig] = useAtom(ConfigAtom);
  
  const initConfig = async () => {
    const data = await loadEncryptedData<Config>(CONFIG_STORAGE_KEY);
    if (data) {
      // Keep initialized false during app startup until initialized() is explicitly called
      setConfig({ ...data, initialized: false });
    } else {
      const defaultVal: Config = { initialized: false, adsEnabled: true, language: 'ko' };
      await saveEncryptedData(CONFIG_STORAGE_KEY, defaultVal);
      setConfig(defaultVal);
    }
  };

  const updateConfig = async (newConfig: Partial<Config>) => {
    setConfig((prev) => {
      const next = { ...prev, ...newConfig };
      saveEncryptedData(CONFIG_STORAGE_KEY, next);
      return next;
    });
  };

  const initialized = async () => {
    if (!config.initialized) {
      await updateConfig({ initialized: true });
    }
  };

  return { config, updateConfig, initialized, initConfig };
};

export default useConfig;