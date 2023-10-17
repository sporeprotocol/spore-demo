import ClusterService from '@/cluster';
import { publicProcedure, router } from '@/server/trpc';
import {
  getOmnilockAnyoneCanPayModeLock,
  isAnyoneCanPay,
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
          withPublic: z.boolean().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { owner, withPublic = false } = input ?? {};
      if (!owner) {
        return ClusterService.shared.list();
      }
      const lock = helpers.parseAddress(owner, {
        config: config.predefined.AGGRON4,
      });
      const querys = [ClusterService.shared.listByLock(lock)];
      if (withPublic && isOmnilockScript(lock) && !isAnyoneCanPay(lock)) {
        const acpModeLock = getOmnilockAnyoneCanPayModeLock(lock);
        querys.push(ClusterService.shared.listByLock(acpModeLock));
      }
      const [clusters = [], acpClusters = []] = await Promise.all(querys);
      return [...clusters, ...acpClusters];
    }),
  recent: publicProcedure
    .input(z.object({
      limit: z.number(),
    }))
    .query(async ({ input }) => {
      const clusters = await ClusterService.shared.recent(input.limit);
      return clusters;
    }),
});
