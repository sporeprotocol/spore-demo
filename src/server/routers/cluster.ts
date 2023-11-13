import ClusterService from '@/cluster';
import { publicProcedure, router } from '@/server/trpc';
import SporeService from '@/spore';
import {
  getOmnilockAnyoneCanPayModeLock,
  isAnyoneCanPay,
  isOmnilockScript,
} from '@/utils/script';
import { BI, config, helpers } from '@ckb-lumos/lumos';
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
        const { items: clusters } = await ClusterService.shared.list();
        return clusters;
      }
      const lock = helpers.parseAddress(owner, {
        config: config.predefined.AGGRON4,
      });
      const querys = [ClusterService.shared.listByLock(lock)];
      if (withPublic && isOmnilockScript(lock) && !isAnyoneCanPay(lock)) {
        const acpModeLock = getOmnilockAnyoneCanPayModeLock(lock);
        querys.push(ClusterService.shared.listByLock(acpModeLock));
      }
      const [{ items: ownedClusters = [] }, { items: acpClusters = [] }] =
        await Promise.all(querys);
      return [...ownedClusters, ...acpClusters];
    }),
  infiniteList: publicProcedure
    .input(
      z
        .object({
          cursor: z.number().optional(),
          limit: z.number().optional(),
          owner: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { cursor = 0, limit = 10 } = input ?? {};
      const options = { skip: cursor, limit };

      const { items: clusters, collected } = await ClusterService.shared.list(
        options,
      );

      const items = await Promise.all(
        clusters.map(async (cluster) => {
          const { items: spores } = await SporeService.shared.list(cluster.id ? [cluster.id] : [], {
            limit: 4,
          });
          return {
            ...cluster,
            spores,
          };
        }),
      );

      return {
        items,
        nextCursor: clusters.length === 0 ? undefined : cursor + collected,
      };
    }),
  recent: publicProcedure
    .input(
      z.object({
        limit: z.number(),
      }),
    )
    .query(async ({ input }) => {
      const clusters = await ClusterService.shared.recent(input.limit);
      return clusters;
    }),
  getCapacityMargin: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const { id } = input;
      if (!id) {
        return BI.from(0).toHexString();
      }

      const margin = await ClusterService.shared.getCapacityMargin(id);
      return margin.toHexString();
    }),
});
