import { atom } from 'jotai';

import type { Config } from '../types/config';

const defaultConfig: Config = {
  initialized: false,
  adsEnabled: true,
  language: 'ko',
};

export const ConfigAtom = atom<Config>(defaultConfig);