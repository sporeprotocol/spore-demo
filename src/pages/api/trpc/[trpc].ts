import { createContext } from '@/server/context';
import { appRouter } from '@/server/routers';
import * as trpcNext from '@trpc/server/adapters/next';

export const maxDuration = 300;

export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  batching: {
    enabled: true,
  },
});
