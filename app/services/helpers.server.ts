import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto';

export const hash = (password: string, salt: string): Promise<string> =>
  new Promise((resolve, reject) => {
    pbkdf2(password, salt, 300_000, 64, 'sha512', (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result.toString('hex'));
    });
  });

export const generateSalt = (): string => randomBytes(128).toString('hex');

const encoder = new TextEncoder();
export const safeCompare = (hash1: string, hash2: string): boolean =>
  timingSafeEqual(encoder.encode(hash1), encoder.encode(hash2));
