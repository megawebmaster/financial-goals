import * as process from 'process';

const getEnv = <T>(
  name: string,
  parseValue: (value: string) => T = (value: string) => value as T,
  defaultValue?: T,
): T => {
  const value = process.env[name];

  if (value) {
    return parseValue(value);
  }

  if (defaultValue) {
    return defaultValue;
  }

  throw new Error(`Environment value ${name} is missing!`);
};

type Config = {
  castle: {
    apiSecret: string;
  };
  session: {
    secret: string;
  };
};

export const config: Config = {
  castle: {
    apiSecret: getEnv('CASTLE_API_SECRET'),
  },
  session: {
    secret: getEnv('SESSION_SECRET'),
  },
};
