import type {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from '@remix-run/node';
import { redirectWithInfo } from 'remix-toast';

import { authenticator } from '~/services/auth.server';
import { LOGIN_ROUTE } from '~/routes';
import i18next from '~/i18n.server';

const redirect = async (request: Request) => {
  const t = await i18next.getFixedT(await i18next.getLocale(request), [
    'errors',
  ]);

  return redirectWithInfo(LOGIN_ROUTE, {
    message: t('login.required'),
  });
};

type AuthenticatedLoaderFunction = (
  args: LoaderFunctionArgs,
  userId: number,
) => ReturnType<LoaderFunction>;

export const authenticatedLoader =
  (loader: AuthenticatedLoaderFunction) => async (args: LoaderFunctionArgs) => {
    const userId = await authenticator.isAuthenticated(args.request);

    if (!userId) {
      return await redirect(args.request);
    }

    return loader(args, userId);
  };

type AuthenticatedActionFunction = (
  args: ActionFunctionArgs,
  userId: number,
) => ReturnType<ActionFunction>;

export const authenticatedAction =
  (action: AuthenticatedActionFunction) => async (args: ActionFunctionArgs) => {
    const userId = await authenticator.isAuthenticated(args.request);

    if (!userId) {
      return await redirect(args.request);
    }

    return action(args, userId);
  };