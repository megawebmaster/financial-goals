import { useNavigation } from '@remix-run/react';
import { useSpinDelay } from 'spin-delay';

type NavigationDelay = {
  delay?: number;
  minDuration?: number;
};

export const DEFAULT_DELAY = 200;
export const DEFAULT_MIN_DURATION = 500;

export const useNavigationDelay = ({
  delay = DEFAULT_DELAY,
  minDuration = DEFAULT_MIN_DURATION,
}: NavigationDelay = {}) => {
  const navigation = useNavigation();
  return useSpinDelay(navigation.state !== 'idle', {
    delay,
    minDuration,
  });
};
