import type { FilterPayload, RiskPayload } from '@castleio/sdk';
import { Castle } from '@castleio/sdk';
import type { ActionFunctionArgs } from '@remix-run/node';
import { getClientIPAddress } from 'remix-utils/get-client-ip-address';

import type { User } from '@prisma/client';
import { config } from '~/config.server';

const castle = new Castle({ apiSecret: config.castle.apiSecret });

type CastleRiskOptions = Omit<
  RiskPayload,
  'request_token' | 'user' | 'context'
> & { type: string };

type CastleResult = {
  risk: number;
};

export const castleRisk = async (
  request: ActionFunctionArgs['request'],
  user: User,
  options: CastleRiskOptions,
): Promise<CastleResult> => {
  const data = await request.clone().formData();

  return (await castle.risk({
    ...options,
    request_token: data.get('requestToken') as string,
    user: {
      id: user.id.toString(),
    },
    context: {
      ip: getClientIPAddress(request) || '193.25.7.133',
      headers: Object.fromEntries(request.headers.entries()),
    },
  })) as CastleResult;
};

type CastleFilterOptions = Omit<FilterPayload, 'request_token' | 'context'> & {
  type: string;
};

export const castleFilter = async (
  request: ActionFunctionArgs['request'],
  options: CastleFilterOptions,
): Promise<CastleResult> => {
  const data = await request.clone().formData();

  return (await castle.filter({
    ...options,
    request_token: data.get('requestToken') as string,
    context: {
      ip: getClientIPAddress(request) || '193.25.7.133',
      headers: Object.fromEntries(request.headers.entries()),
    },
  })) as CastleResult;
};
