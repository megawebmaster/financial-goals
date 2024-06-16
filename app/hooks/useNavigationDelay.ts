import { useNavigation } from '@remix-run/react';
import { useSpinDelay } from 'spin-delay';

type NavigationDelay = {
  delay?: number;
  minDuration?: number;
};

export const useNavigationDelay = ({
  delay = 200,
  minDuration = 500,
}: NavigationDelay = {}) => {
  const navigation = useNavigation();
  return useSpinDelay(navigation.state !== 'idle', {
    delay,
    minDuration,
  });
};
