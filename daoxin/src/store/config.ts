import { atom } from 'jotai';

import type { Config } from '../types/config';

const defaultConfig: Config = {
  initialized: false,
  adsEnabled: true,
};

export const ConfigAtom = atom<Config>(defaultConfig);