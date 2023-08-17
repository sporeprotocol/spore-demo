import ClusterService from '@/cluster';
import { publicProcedure, router } from '@/server/trpc';
import {
  getOmnilockAnyoneCanPayModeLock,
  isOmnilockScript,
} from '@/utils/script';
import { config, helpers } from '@ckb-lumos/lumos';
import z from 'zod';

export const clusterRouter = router({
  get: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input?.id) {
        return undefined;
      }
      const cluster = ClusterService.shared.get(input.id);
      return cluster;
    }),
  list: publicProcedure
    .input(
      z
        .object({
          owner: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { owner } = input ?? {};
      if (!owner) {
        return ClusterService.shared.list();
      }
      const lock = helpers.parseAddress(owner, {
        config: config.predefined.AGGRON4,
      });
      const querys = [ClusterService.shared.listByLock(lock)];
      if (isOmnilockScript(lock)) {
        const acpModeLock = getOmnilockAnyoneCanPayModeLock(lock);
        querys.push(ClusterService.shared.listByLock(acpModeLock));
      }
      const [clusters = [], acpClusters = []] = await Promise.all(querys);
      return [...clusters, ...acpClusters];
    }),
});
