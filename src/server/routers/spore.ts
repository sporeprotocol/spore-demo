import { publicProcedure, router } from '@/server/trpc';
import SporeService from '@/spore';
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
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const { clusterId, owner } = input ?? {};
      if (!owner) {
        return SporeService.shared.list(clusterId);
      }

      const lock = helpers.parseAddress(owner, {
        config: config.predefined.AGGRON4,
      });
      const spores = await SporeService.shared.listByLock(lock, clusterId);
      return spores;
    }),
});
