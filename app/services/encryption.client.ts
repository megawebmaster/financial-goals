import {
  decodeUrlSafeBase64ToArrayBuffer,
  encodeArrayBufferToUrlSafeBase64,
} from '~/helpers/encoding';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

export const storeKeyMaterial = async (password: string): Promise<void> => {
  const digest = await window.crypto.subtle.digest(
    'SHA-512',
    encoder.encode(password),
  );
  window.sessionStorage.setItem(KEY_MATERIAL, decoder.decode(digest));
};

export const generateEncryptionKey = async (): Promise<CryptoKey> =>
  await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );

export const buildWrappingKey = async (salt: string) => {
  if (await store.getKey('wrapping')) {
    // Key already exists
    return;
  }

  const digest = sessionStorage.getItem(KEY_MATERIAL);
  if (!digest) {
    throw new Error('Unable to build wrapping key!');
  }

  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(digest),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );
  const key = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-KW', length: 256 },
    false,
    ['wrapKey', 'unwrapKey'],
  );
  await store.setKey('wrapping', key);
  window.sessionStorage.removeItem(KEY_MATERIAL);
};

export const clearEncryption = async () => await store.clear();

export const unlockKey = async (encryptedKey: string) => {
  const unlocked = await store.getKey(encryptedKey);
  if (unlocked) {
    return unlocked;
  }

  const wrappingKey = await store.getKey('wrapping');

  if (!wrappingKey) {
    throw new Error('Wrapping key is missing! Invalid encryption usage!');
  }

  const key = await window.crypto.subtle.unwrapKey(
    'raw',
    decodeUrlSafeBase64ToArrayBuffer(encryptedKey),
    wrappingKey,
    'AES-KW',
    'AES-GCM',
    false,
    ['encrypt', 'decrypt'],
  );
  await store.setKey(encryptedKey, key);

  return key;
};

export const lockKey = async (key: CryptoKey) => {
  const wrappingKey = await store.getKey('wrapping');

  if (!wrappingKey) {
    throw new Error('Wrapping key is missing! Invalid encryption usage!');
  }

  const wrappedKey = await window.crypto.subtle.wrapKey(
    'raw',
    key,
    wrappingKey,
    'AES-KW',
  );

  return encodeArrayBufferToUrlSafeBase64(wrappedKey);
};

export const encrypt = async (
  value: string,
  key: CryptoKey,
): Promise<string> => {
  const iv = await window.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(value),
  );

  return JSON.stringify({
    value: encodeArrayBufferToUrlSafeBase64(encrypted),
    iv: encodeArrayBufferToUrlSafeBase64(iv),
  });
};

export const decrypt = async (
  encrypted: string,
  key: CryptoKey,
): Promise<string> => {
  const { value, iv } = JSON.parse(encrypted);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: decodeUrlSafeBase64ToArrayBuffer(iv),
    },
    key,
    decodeUrlSafeBase64ToArrayBuffer(value),
  );

  return decoder.decode(decrypted);
};
