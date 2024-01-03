import type { ReactNode } from 'react';
import { useContext, createContext, useMemo } from 'react';
import Castle from '@castleio/castle-js';

const CastleContext = createContext<
  ReturnType<typeof Castle.configure> | undefined
>(undefined);

type CastleContextProviderProps = {
  children: ReactNode;
};

export const CastleContextProvider = ({
  children,
}: CastleContextProviderProps) => {
  const castle = useMemo(() => {
    try {
      return Castle.configure({ pk: 'pk_NGSpvyx6Mx1EgpJp4xUhtzYMxkLrkryR' });
    } catch (e) {
      // Most likely - an SSR error
    }
  }, []);

  return (
    <CastleContext.Provider value={castle}>{children}</CastleContext.Provider>
  );
};

export const useCastle = () => useContext(CastleContext);
