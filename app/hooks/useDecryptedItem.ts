import { useEffect, useState } from 'react';
import { useSpinDelay } from 'spin-delay';

type DecryptedData<T> = {
  data?: T;
  decrypting: boolean;
  loading: boolean;
};

export const useDecryptedItem = <T extends object>(
  decryptFn: () => Promise<T>,
): DecryptedData<T> => {
  const [decrypting, setDecrypting] = useState(true);
  const [data, setData] = useState<T>();

  const isDecrypting = useSpinDelay(decrypting, {
    delay: 100,
    minDuration: 300,
  });

  useEffect(() => {
    if (decrypting) {
      setDecrypting(true);
      decryptFn()
        .then((results) => {
          setData(results);
        })
        .finally(() => {
          setDecrypting(false);
        });
    }
  }, [decrypting, decryptFn]);

  return {
    data,
    decrypting: isDecrypting,
    loading: !data && isDecrypting,
  };
};
