import {
  decodeUrlSafeBase64ToArrayBuffer,
  encodeArrayBufferToUrlSafeBase64,
} from '~/helpers/encoding';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const generateKeyMaterial = async (
  password: string,
): Promise<string> => {
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-512',
    encoder.encode(password),
  );
  return decoder.decode(digest);
};

export const generateEncryptionKey = async (): Promise<CryptoKey> =>
  await globalThis.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  );

export const generatePKI = async (): Promise<CryptoKeyPair> =>
  await globalThis.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      // @ts-ignore
      modulusLength: 4096,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: 'SHA-512',
    },
    true,
    ['encrypt', 'decrypt'],
  );

export const generateWrappingKey = async (
  digest: string,
  salt: string,
): Promise<CryptoKey> => {
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(digest),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  );
  return await globalThis.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000,
      hash: 'SHA-512',
    },
    keyMaterial,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['wrapKey', 'unwrapKey'],
  );
};

export const encrypt = async (
  value: string,
  key: CryptoKey,
): Promise<string> => {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    {
      name: key.algorithm.name,
      iv,
    },
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

  const decrypted = await globalThis.crypto.subtle.decrypt(
    {
      name: key.algorithm.name,
      iv: decodeUrlSafeBase64ToArrayBuffer(iv),
    },
    key,
    decodeUrlSafeBase64ToArrayBuffer(value),
  );

  return decoder.decode(decrypted);
};

export const unlockKey = async (
  wrappingKey: CryptoKey,
  encryptedKey: string,
  usages: KeyUsage[],
): Promise<CryptoKey> => {
  const { key, iv, algo } = JSON.parse(encryptedKey);
  return await globalThis.crypto.subtle.unwrapKey(
    'jwk',
    decodeUrlSafeBase64ToArrayBuffer(key),
    wrappingKey,
    {
      name: 'AES-GCM',
      iv: decodeUrlSafeBase64ToArrayBuffer(iv),
    },
    algo,
    true,
    usages,
  );
};

const getKeyAlgorith = (algo: string): Record<string, string> => {
  switch (algo) {
    case 'RSA-OAEP':
      return {
        name: algo,
        hash: 'SHA-512',
      };
    case 'AES-GCM':
      return {
        name: algo,
      };
    default:
      throw new Error(`Unsupported key type: ${algo}`);
  }
};

export const lockKey = async (
  wrappingKey: CryptoKey,
  key: CryptoKey,
): Promise<string> => {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const wrappedKey = await globalThis.crypto.subtle.wrapKey(
    'jwk',
    key,
    wrappingKey,
    {
      name: 'AES-GCM',
      iv,
    },
  );

  return JSON.stringify({
    key: encodeArrayBufferToUrlSafeBase64(wrappedKey),
    iv: encodeArrayBufferToUrlSafeBase64(iv),
    algo: getKeyAlgorith(key.algorithm.name),
  });
};

export const importKey = async (
  exportedKey: string,
  usages: KeyUsage[],
): Promise<CryptoKey> => {
  const { key, algo } = JSON.parse(exportedKey);

  return await globalThis.crypto.subtle.importKey(
    // @ts-ignore
    'jwk',
    key,
    algo,
    true,
    usages,
  );
};

export const exportKey = async (key: CryptoKey): Promise<string> => {
  const exportedKey = await globalThis.crypto.subtle.exportKey('jwk', key);

  return JSON.stringify({
    key: exportedKey,
    algo: getKeyAlgorith(key.algorithm.name),
  });
};
