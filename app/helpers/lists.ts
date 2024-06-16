import { equals, type KeyValuePair, reduce, reduced, zip } from 'ramda';

const listsComparator = reduce(
  (_, [previous, current]: KeyValuePair<object, object>) => {
    if (equals(previous, current)) {
      return reduced(true);
    }

    return false;
  },
  false,
);

export const areListsEqual = <T extends object>(
  previousList: T[],
  currentList: T[],
) => {
  if (previousList.length !== currentList.length) {
    return false;
  }

  return listsComparator(zip(previousList, currentList));
};
