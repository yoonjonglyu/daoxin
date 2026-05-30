import React, { useState, useRef } from 'react';
import './SettingsModal.css';

import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

import useConfig from '../../hooks/useConfig';
import { useTranslation } from '../../utils/i18n';
import {
  exportAllData,
  importAllData,
  type DaoxinBackupData,
} from '../../utils/backup';
import {
  loadGoogleScript,
  requestAccessToken,
  searchBackupFile,
  downloadBackupFile,
  uploadBackupFile,
} from '../../services/googleDriveService';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Default Google OAuth Client ID (users may override with their own)
const DEFAULT_CLIENT_ID =
  '461126878180-licdkmqjj8b2sbmkl0ncg3fihldaufe4.apps.googleusercontent.com'; // 빈 값이면 구글 드라이브 기능 사용 불가 안내
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useConfig();
  const { t } = useTranslation();

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');
  const [syncError, setSyncError] = useState('');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clientIdInput, setClientIdInput] = useState(
    config.googleClientId || '',
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const effectiveClientId = clientIdInput.trim() || DEFAULT_CLIENT_ID;

  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Language ───────────────────────────────────────────
  const handleSetLanguage = (lang: 'ko' | 'en') => {
    updateConfig({ language: lang });
  };

  // ─── Export ─────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const data = await exportAllData();
      const json = JSON.stringify(data, null, 2);
      const fileName = `daoxin_backup_${new Date().toISOString().slice(0, 10)}.json`;

      if (Capacitor.isNativePlatform()) {
        // Android/iOS: Save to cache and trigger Native Share
        const result = await Filesystem.writeFile({
          path: fileName,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });

        await Share.share({
          title: t('exportData'),
          url: result.uri,
        });
      } else {
        // Web: Use standard browser download
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
      }
      showToast(
        '✅ ' +
          (config.language === 'en'
            ? 'Data exported successfully!'
            : '데이터를 내보냈습니다!'),
      );
    } catch (err) {
      console.error('Export error:', err);
      showToast(
        '❌ ' +
          (config.language === 'en'
            ? 'Export failed.'
            : '내보내기에 실패했습니다.'),
        'error',
      );
    }
  };

  // ─── Import ─────────────────────────────────────────────
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text) as DaoxinBackupData;
        const success = await importAllData(data);

        if (success) {
          showToast('✅ ' + t('importSuccess'));
          setTimeout(() => window.location.reload(), 1800);
        } else {
          showToast('❌ ' + t('importError'), 'error');
        }
      } catch (err) {
        console.error('Import parse error:', err);
        showToast('❌ ' + t('importError'), 'error');
      }
    };

    reader.onerror = () => {
      showToast('❌ ' + t('importError'), 'error');
    };

    reader.readAsText(file);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Google Drive ────────────────────────────────────────
  const handleGoogleLogin = async () => {
    if (!effectiveClientId) {
      showToast(
        '❌ ' +
          (config.language === 'en'
            ? 'Please enter a Google Client ID first.'
            : '구글 클라이언트 ID를 먼저 입력해 주세요.'),
        'error',
      );
      return;
    }

    try {
      let token: string | null = null;

      if (Capacitor.isNativePlatform()) {
        await GoogleSignIn.initialize({
          clientId: effectiveClientId,
          scopes: [SCOPES],
        });
        const result = await GoogleSignIn.signIn();
        token = result.accessToken || null;
      } else {
        // Web: Existing web script logic
        await loadGoogleScript();
        token = await requestAccessToken(effectiveClientId) || null;
      }

      if (!token) {
        throw new Error('No access token received');
      }

      setAccessToken(token);
      setIsLoggedIn(true);
      // Save client ID to config
      await updateConfig({ googleClientId: clientIdInput.trim() });
      showToast(
        '✅ ' +
          (config.language === 'en'
            ? 'Signed in to Google!'
            : '구글 계정에 연결되었습니다!'),
      );
    } catch (err: any) {
      showToast('❌ ' + (err?.message || 'Google login failed'), 'error');
    }
  };

  const handleGoogleLogout = () => {
    setAccessToken(null);
    setIsLoggedIn(false);
    setSyncStatus('idle');
  };

  const handleSync = async () => {
    if (!accessToken) return;
    setSyncStatus('syncing');
    setSyncError('');
    try {
      const data = await exportAllData();
      const existing = await searchBackupFile(accessToken);
      await uploadBackupFile(accessToken, data, existing?.id);
      const now = new Date().toLocaleString(
        config.language === 'en' ? 'en-US' : 'ko-KR',
      );
      await updateConfig({ lastSyncTime: now });
      setSyncStatus('success');
      showToast('✅ ' + t('syncSuccess'));
    } catch (err: any) {
      setSyncStatus('error');
      const msg = err?.message || 'Unknown error';
      setSyncError(msg);
      showToast('❌ ' + t('syncFailed', { error: msg }), 'error');
    }
  };

  const handleDownloadFromDrive = async () => {
    if (!accessToken) return;
    setSyncStatus('syncing');
    setSyncError('');
    try {
      const existing = await searchBackupFile(accessToken);
      if (!existing) {
        showToast(
          config.language === 'en'
            ? '⚠️ No backup found on Drive.'
            : '⚠️ 드라이브에 백업 파일이 없습니다.',
          'error',
        );
        setSyncStatus('idle');
        return;
      }
      const data = await downloadBackupFile(accessToken, existing.id);
      const success = await importAllData(data);
      if (success) {
        setSyncStatus('success');
        showToast('✅ ' + t('importSuccess'));
        setTimeout(() => window.location.reload(), 1800);
      } else {
        setSyncStatus('error');
        showToast('❌ ' + t('importError'), 'error');
      }
    } catch (err: any) {
      setSyncStatus('error');
      const msg = err?.message || 'Unknown error';
      setSyncError(msg);
      showToast('❌ ' + t('syncFailed', { error: msg }), 'error');
    }
  };

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      {/* Overlay */}
      <div
        className='settings-overlay'
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}>
        <div className='settings-card'>
          {/* Corner decorations */}
          <div className='settings-corner tl' />
          <div className='settings-corner tr' />
          <div className='settings-corner bl' />
          <div className='settings-corner br' />

          {/* Header */}
          <div className='settings-header'>
            <div className='settings-header-left'>
              <span className='settings-header-icon'>⚙️</span>
              <h2 className='settings-title'>{t('settingsTitle')}</h2>
            </div>
            <button
              className='settings-close-btn'
              onClick={onClose}
              aria-label='Close settings'>
              ✕
            </button>
          </div>

          <div className='settings-body'>
            {/* ─── 1. Language ─────────────────────────── */}
            <div className='settings-section'>
              <div className='settings-section-title'>
                <span className='settings-section-icon'>🌐</span>
                {t('languageSetting')}
              </div>
              <div className='language-toggle'>
                <button
                  id='lang-ko-btn'
                  className={`lang-btn ${config.language === 'ko' ? 'active' : ''}`}
                  onClick={() => handleSetLanguage('ko')}>
                  🇰🇷 한국어
                </button>
                <button
                  id='lang-en-btn'
                  className={`lang-btn ${config.language === 'en' ? 'active' : ''}`}
                  onClick={() => handleSetLanguage('en')}>
                  🇺🇸 English
                </button>
              </div>
            </div>

            {/* ─── 2. Backup & Restore ─────────────────── */}
            <div className='settings-section'>
              <div className='settings-section-title'>
                <span className='settings-section-icon'>💾</span>
                {t('backupRestore')}
              </div>
              <div className='backup-buttons'>
                <button
                  id='export-data-btn'
                  className='backup-btn export'
                  onClick={handleExport}>
                  📤 {t('exportData')}
                </button>
                <button
                  id='import-data-btn'
                  className='backup-btn import'
                  onClick={handleImportClick}>
                  📥 {t('importData')}
                </button>
              </div>
            </div>

            {/* ─── 3. Google Drive Sync ────────────────── */}
            <div className='settings-section'>
              <div className='settings-section-title'>
                <span className='settings-section-icon'>☁️</span>
                {t('googleSync')}
              </div>
              <div className='google-section-content'>
                <p className='google-info-text'>{t('driveSyncInfo')}</p>

                {/* Client ID input */}
                <div>
                  <label className='client-id-label'>
                    {t('clientIdLabel')}
                  </label>
                  <input
                    id='google-client-id-input'
                    className='client-id-input'
                    type='text'
                    placeholder='xxxxxxxxxx.apps.googleusercontent.com'
                    value={clientIdInput}
                    onChange={(e) => setClientIdInput(e.target.value)}
                    disabled={isLoggedIn}
                  />
                  <p className='client-id-help'>{t('clientIdHelp')}</p>
                </div>

                {!isLoggedIn ? (
                  <button
                    id='google-login-btn'
                    className='google-btn login'
                    onClick={handleGoogleLogin}>
                    <svg
                      width='18'
                      height='18'
                      viewBox='0 0 18 18'
                      style={{ flexShrink: 0 }}>
                      <path
                        fill='#4285F4'
                        d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z'
                      />
                      <path
                        fill='#34A853'
                        d='M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z'
                      />
                      <path
                        fill='#FBBC05'
                        d='M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z'
                      />
                      <path
                        fill='#EA4335'
                        d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z'
                      />
                    </svg>
                    {t('googleLogin')}
                  </button>
                ) : (
                  <>
                    <div className='google-account-row'>
                      <span className='google-account-icon'>✅</span>
                      <div className='google-account-info'>
                        <span className='google-account-label'>
                          {config.language === 'en'
                            ? 'Connected to Google Drive'
                            : '구글 드라이브 연결됨'}
                        </span>
                        {config.lastSyncTime && (
                          <span className='google-sync-time'>
                            {t('lastSyncTime', { time: config.lastSyncTime })}
                          </span>
                        )}
                      </div>
                      <button
                        id='google-logout-btn'
                        className='google-btn logout'
                        onClick={handleGoogleLogout}>
                        {t('googleLogout')}
                      </button>
                    </div>

                    <div className='google-action-row'>
                      <button
                        id='google-sync-upload-btn'
                        className='google-btn sync'
                        onClick={handleSync}
                        disabled={syncStatus === 'syncing'}>
                        {syncStatus === 'syncing'
                          ? t('syncing')
                          : '⬆ ' +
                            (config.language === 'en'
                              ? 'Upload to Drive'
                              : '드라이브에 업로드')}
                      </button>
                      <button
                        id='google-sync-download-btn'
                        className='google-btn sync'
                        onClick={handleDownloadFromDrive}
                        disabled={syncStatus === 'syncing'}>
                        {syncStatus === 'syncing'
                          ? t('syncing')
                          : '⬇ ' +
                            (config.language === 'en'
                              ? 'Download from Drive'
                              : '드라이브에서 불러오기')}
                      </button>
                    </div>

                    {syncStatus === 'success' && (
                      <div className='sync-status success'>
                        ✅ {t('syncSuccess')}
                      </div>
                    )}
                    {syncStatus === 'error' && (
                      <div className='sync-status error'>
                        ❌ {t('syncFailed', { error: syncError })}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* ─── 4. App Info ─────────────────────────── */}
            <div className='settings-section'>
              <div className='settings-section-title'>
                <span className='settings-section-icon'>📖</span>
                {t('appInfo')}
              </div>
              <div className='app-info-list'>
                <div className='app-info-row'>
                  <span className='app-info-row-label'>
                    {config.language === 'en' ? 'App Name' : '앱 이름'}
                  </span>
                  <span className='app-info-row-value'>ABILITY: DaoXin</span>
                </div>
                <div className='app-info-row'>
                  <span className='app-info-row-label'>
                    {config.language === 'en' ? 'Version' : '버전'}
                  </span>
                  <span className='app-info-row-value'>v2.0.0</span>
                </div>
                <div className='app-info-row'>
                  <span className='app-info-row-label'>
                    {config.language === 'en' ? 'Developer' : '개발자'}
                  </span>
                  <span className='app-info-row-value'>
                    <a href='mailto:yunjonglyu@gmail.com'>
                      yunjonglyu@gmail.com
                    </a>
                  </span>
                </div>
                <div className='app-info-row'>
                  <span className='app-info-row-label'>
                    {config.language === 'en' ? 'Source' : '소스코드'}
                  </span>
                  <span className='app-info-row-value'>
                    <a
                      href='https://github.com/yoonjonglyu/daoxin'
                      target='_blank'
                      rel='noopener noreferrer'>
                      GitHub ↗
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* ─── 5. Privacy Policy ───────────────────── */}
            <div className='settings-section'>
              <div className='settings-section-title'>
                <span className='settings-section-icon'>🔒</span>
                {t('privacyPolicy')}
              </div>
              <p className='privacy-text'>{t('privacyText')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`settings-toast ${toast.type === 'error' ? 'error' : ''}`}>
          {toast.message}
        </div>
      )}
    </>
  );
};

export default SettingsModal;
