import { publicProcedure, router } from '@/server/trpc';
import SporeService, { Spore } from '@/spore';
import { config, helpers } from '@ckb-lumos/lumos';
import z from 'zod';

export const sporeRouter = router({
  get: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      if (!input.id) {
        return undefined;
      }
      const spore = SporeService.shared.get(input.id);
      return spore;
    }),
  list: publicProcedure
    .input(
      z
        .object({
          clusterId: z.string().optional(),
          owner: z.string().optional(),
          skip: z.number().optional(),
          limit: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { clusterId, owner, skip, limit } = input ?? {};
      const options = { skip, limit };

      const getSpores = async () => {
        if (owner) {
          const lock = helpers.parseAddress(owner, {
            config: config.predefined.AGGRON4,
          });
          return await SporeService.shared.listByLock(lock, clusterId, options);
        }
        return await SporeService.shared.list(clusterId, options);
      };

      const { items: spores } = await getSpores();
      return spores;
    }),
  infiniteList: publicProcedure
    .input(
      z
        .object({
          clusterId: z.string().optional(),
          cursor: z.number().optional(),
          limit: z.number().optional(),
          owner: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { clusterId, owner, cursor = 0, limit = 10 } = input ?? {};
      const options = { skip: cursor, limit };

      const getSpores = async () => {
        if (owner) {
          const lock = helpers.parseAddress(owner, {
            config: config.predefined.AGGRON4,
          });
          return await SporeService.shared.listByLock(lock, clusterId, options);
        }
        return await SporeService.shared.list(clusterId, options);
      };

      const { items: spores, collected } = await getSpores();
      return {
        items: spores,
        nextCursor: spores.length === 0 ? undefined : cursor + collected,
      };
    }),
});
