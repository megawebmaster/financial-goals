import { useEffect, useRef, useState } from 'react';
import { equals, type KeyValuePair, reduce, reduced, zip } from 'ramda';
import { useSpinDelay } from 'spin-delay';

const listsComparator = reduce(
  (_, [previous, current]: KeyValuePair<object, object>) => {
    if (equals(previous, current)) {
      return reduced(true);
    }

    return false;
  },
  false,
);

const areListsEqual = <T extends object>(
  previousList: T[],
  currentList: T[],
) => {
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
  const currentItems = useRef(items);
  const [decrypting, setDecrypting] = useState(true);
  const [data, setData] = useState<R[]>();

  const isDecrypting = useSpinDelay(decrypting, {
    delay: 100,
    minDuration: 300,
  });

  useEffect(() => {
    if (decrypting || !areListsEqual(items, currentItems.current)) {
      setDecrypting(true);
      decryptFn(items)
        .then((results) => {
          currentItems.current = items;
          setData(results);
        })
        .finally(() => {
          setDecrypting(false);
        });
    }
  }, [decrypting, items, decryptFn]);

  return {
    data,
    decrypting: isDecrypting,
    loading: !data && isDecrypting,
  };
};
