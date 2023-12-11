import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { createContext, createApolloServer } from 'spore-graphql';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { KeyvAdapter } from '@apollo/utils.keyvadapter';
import Keyv, { Store } from 'keyv';
import { kv } from '@vercel/kv';
import { GraphQLRequestContext } from '@apollo/server';
import { MD5 } from 'crypto-js';
import { isResponseCacheEnabled } from '@/utils/graphql';

export const fetchCache = 'force-no-store';
export const maxDuration = 300;

const RESPONSE_CACHE_ENABLED =
  process.env.NEXT_PUBLIC_RESPONSE_CACHE_ENABLED === 'true' && process.env.KV_URL;

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
    return count > 0;
  },
  async clear(): Promise<void> {
    await kv.flushall();
  },
};

const cache = new KeyvAdapter(new Keyv({ store }));

function generateCacheKey(requestContext: GraphQLRequestContext<Record<string, any>>) {
  const { request } = requestContext;
  const { query, variables } = request;
  return MD5(JSON.stringify({ query, variables })).toString();
}

const server = createApolloServer({
  introspection: true,
  ...(RESPONSE_CACHE_ENABLED
    ? {
      cache,
      plugins: [
        ApolloServerPluginCacheControl({
          defaultMaxAge: 60 * 60 * 24 * 365,
        }),
        responseCachePlugin({
          generateCacheKey,
          shouldReadFromCache: async (requestContext) => {
            return isResponseCacheEnabled(requestContext);
          },
        }),
      ],
    }
    : {}),
});

const context = createContext();

const handler = startServerAndCreateNextHandler(server, {
  context: async () => context,
});

export { handler as GET, handler as POST };
