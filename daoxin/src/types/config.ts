export interface Config {
  initialized: boolean;
  adsEnabled: boolean;
  language: 'ko' | 'en';
  googleClientId?: string;
  lastSyncTime?: string;
}