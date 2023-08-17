import { router } from '../trpc';
import { accountRouter } from './account';
import { clusterRouter } from './cluster';
import { sporeRouter } from './spore';

export const appRouter = router({
  cluster: clusterRouter,
  spore: sporeRouter,
  accout: accountRouter,
});

export type AppRouter = typeof appRouter;
