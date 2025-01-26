import { useEffect, useRef, useState } from 'react';
import { equals, type KeyValuePair, reduce, reduced, zip } from 'ramda';
import { useSpinDelay } from 'spin-delay';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@remix-run/react';

const listsComparator = reduce(
  (_, [previous, current]: KeyValuePair<object, object>) => {
    if (!equals(previous, current)) {
      return reduced(false);
    }

    return true;
  },
  true,
);

const areListsEqual = <T extends object>(
  previousList: T[] | undefined,
  currentList: T[] | undefined,
) => {
  if (previousList === undefined) {
    return currentList === undefined;
  }
  if (currentList === undefined) {
    return false;
  }
  if (previousList.length !== currentList.length) {
    return false;
  }

  return listsComparator(zip(previousList, currentList));
};

type DecryptedData<T> = {
  data?: T[];
  decrypting: boolean;
  loading: boolean;
};

export const useDecryptedList = <T extends object, R extends object>(
  items: T[],
  decryptFn: (items: T[]) => Promise<R[]>,
): DecryptedData<R> => {
  const { t } = useTranslation('errors');
  const navigate = useNavigate();
  const currentItems = useRef<T[]>(undefined);
  const [decrypting, setDecrypting] = useState(true);
  const [data, setData] = useState<R[]>();

  const isDecrypting = useSpinDelay(decrypting, {
    delay: 100,
    minDuration: 300,
  });

  useEffect(() => {
    const run = async () => {
      if (!areListsEqual(currentItems.current, items)) {
        setDecrypting(true);
        try {
          setData(await decryptFn(items));
        } catch (e) {
          navigate('/logout');
          toast.error(t('decryption.failure'));
        } finally {
          currentItems.current = items;
          setDecrypting(false);
        }
      }
    };

    run();
  }, [items, decryptFn, navigate, t]);

  return {
    data,
    decrypting: isDecrypting,
    loading: data === undefined || isDecrypting,
  };
};
