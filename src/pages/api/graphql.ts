import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { createContext, createApolloServer, ContextValue } from 'spore-graphql';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import { kv } from '@vercel/kv';
import Keyv, { Store } from 'keyv';

export const config = {
  maxDuration: 300,
};

type CustomContext = ContextValue & {
  disableCache?: boolean;
};

const store: Store<string> = {
  async get(key: string): Promise<string | undefined> {
    const val = await kv.get(key);
    return val as string | undefined;
  },
  async set(key: string, value: string, ttl?: number | undefined) {
    if (ttl) {
      return kv.set(key, value, { px: ttl });
    }
    return kv.set(key, value);
  },
  async delete(key: string): Promise<boolean> {
    const count = await kv.del(key);
    return count === 1;
  },
  async clear(): Promise<void> {
    await kv.flushall();
  },
};

const cache = new KeyvAdapter(new Keyv({ store }));

export default startServerAndCreateNextHandler(
  createApolloServer<CustomContext>({
    introspection: true,
    cache,
    plugins: [
      ApolloServerPluginCacheControl({
        defaultMaxAge: 60 * 24,
      }),
      responseCachePlugin(),
    ],
  }),
  {
    context: async () => createContext(),
  },
);
