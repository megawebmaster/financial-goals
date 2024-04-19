import {
  decrypt,
  encrypt,
  generateEncryptionKey,
  generateKeyMaterial,
  generateWrappingKey,
  lockKey as encryptLockKey,
  unlockKey as encryptUnlockKey,
} from '~/services/encryption';

class KeyStore {
  private db?: IDBDatabase;

  public async open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('KeyStore', 1);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject('Unable to use KeyStore DB!');
      };
      request.onblocked = () => {
        reject('KeyStore DB is already opened');
      };
      request.onupgradeneeded = (event) => {
        if (event.oldVersion === 0) {
          request.result.createObjectStore('keys', { keyPath: 'name' });
        }
      };
    });
  }

  public getKey(name: string): Promise<CryptoKey | undefined> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        this.db = await this.open();
      }

      const transaction = this.db.transaction('keys', 'readonly');
      const store = transaction.objectStore('keys');
      const request = store.get(name);

      if (!request) {
        reject(`Unable to create KeyStore fetch value request! (key: ${name})`);
        return;
      }
      request.onerror = () => {
        reject(`Unable to fetch ${name} key!`);
      };
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.key as CryptoKey);
        } else {
          resolve(undefined);
        }
      };
    });
  }

  public setKey(name: string, key: CryptoKey): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        this.db = await this.open();
      }

      const transaction = this.db.transaction('keys', 'readwrite');
      const store = transaction.objectStore('keys');
      const request = store.put({ key, name });

      if (!request) {
        reject(`Unable to create KeyStore save value request! (key: ${name})`);
        return;
      }

      request.onerror = () => {
        reject(`Unable to store ${name} key!`);
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public clear(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.db) {
        this.db = await this.open();
      }

      const transaction = this.db.transaction('keys', 'readwrite');
      const store = transaction.objectStore('keys');
      const request = store.clear();

      if (!request) {
        reject('Unable to create KeyStore clear request!');
        return;
      }

      request.onerror = () => {
        reject('Unable to clear KeyStore!');
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }
}

const store = new KeyStore();
const KEY_MATERIAL = 'source-material';
const WRAPPING_KEY = 'wrapping';

export const storeKeyMaterial = async (password: string): Promise<void> => {
  globalThis.sessionStorage.setItem(
    KEY_MATERIAL,
    await generateKeyMaterial(password),
  );
};

export const buildWrappingKey = async (salt: string) => {
  if (await store.getKey(WRAPPING_KEY)) {
    // Key already exists
    return;
  }

  const digest = sessionStorage.getItem(KEY_MATERIAL);
  if (!digest) {
    throw new Error('Unable to build wrapping key!');
  }

  const key = await generateWrappingKey(digest, salt);
  await store.setKey(WRAPPING_KEY, key);
  globalThis.sessionStorage.removeItem(KEY_MATERIAL);
};

export const clearEncryption = async () => await store.clear();

export const unlockKey = async (
  encryptedKey: string,
  usages: KeyUsage[] = ['encrypt', 'decrypt'],
) => {
  const unlocked = await store.getKey(encryptedKey);
  if (unlocked) {
    return unlocked;
  }

  const wrappingKey = await store.getKey(WRAPPING_KEY);

  if (!wrappingKey) {
    throw new Error('Wrapping key is missing! Invalid encryption usage!');
  }

  const key = await encryptUnlockKey(wrappingKey, encryptedKey, usages);
  await store.setKey(encryptedKey, key);

  return key;
};

export const lockKey = async (key: CryptoKey) => {
  const wrappingKey = await store.getKey(WRAPPING_KEY);

  if (!wrappingKey) {
    throw new Error('Wrapping key is missing! Invalid encryption usage!');
  }

  return await encryptLockKey(wrappingKey, key);
};

export { encrypt, decrypt, generateEncryptionKey };
