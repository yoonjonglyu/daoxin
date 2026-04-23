import {
  decryptData,
  encryptData,
  setLocalStorage,
  getLocalStorage,
} from 'isa-util';
import { SALT } from '../value';

export const saveEncryptedData = async <T>(key: string, data: T) => {
  try {
    const encryptedValue = await encryptData(
      JSON.stringify(data),
      SALT,
      SALT,
    );
    setLocalStorage(key, encryptedValue);
  } catch (error) {
    console.error(`${key} 저장 중 오류 발생:`, error);
  }
};

export const loadEncryptedData = async <T>(key: string): Promise<T | null> => {
  const storedData = getLocalStorage<any>(key);
  if (!storedData) return null;

  try {
    const decrypted = await decryptData(
      storedData.encryptedData,
      storedData.iv,
      SALT,
      SALT,
    );
    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error(`${key} 로드 중 오류 발생:`, error);
    return null;
  }
};