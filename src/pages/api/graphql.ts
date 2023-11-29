import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { createContext, createApolloServer } from 'spore-graphql';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import { kv } from '@vercel/kv';
import Keyv, { Store } from 'keyv';

export const config = {
  maxDuration: 300,
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

export const server = createApolloServer({
  introspection: true,
  cache,
  plugins: [
    ApolloServerPluginCacheControl({
      defaultMaxAge: 60 * 60 * 24 * 365,
    }),
    responseCachePlugin({
      shouldReadFromCache: async (requestContext) => {
        if (requestContext.request.http?.headers.get('Cache-Control') === 'no-cache') {
          return false;
        }
        return true;
      }
    }),
  ],
});

export const context = createContext();

export default startServerAndCreateNextHandler(server, {
  context: async () => context,
});
