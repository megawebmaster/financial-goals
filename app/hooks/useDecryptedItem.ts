import { useEffect, useState } from 'react';
import { useSpinDelay } from 'spin-delay';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@remix-run/react';

type DecryptedData<T> = {
  data?: T;
  decrypting: boolean;
  loading: boolean;
};

export const useDecryptedItem = <T extends object>(
  decryptFn: () => Promise<T>,
): DecryptedData<T> => {
  const { t } = useTranslation('errors');
  const navigate = useNavigate();
  const [decrypting, setDecrypting] = useState(true);
  const [data, setData] = useState<T>();

  const isDecrypting = useSpinDelay(decrypting, {
    delay: 100,
    minDuration: 300,
  });

  useEffect(() => {
    const run = async () => {
      setDecrypting(true);
      try {
        setData(await decryptFn());
      } catch (e) {
        navigate('/logout');
        toast.error(t('decryption.failure'));
      } finally {
        setDecrypting(false);
      }
    };

    run();
  }, [decryptFn, navigate, t]);

  return {
    data,
    decrypting: isDecrypting,
    loading: data === undefined || isDecrypting,
  };
};
