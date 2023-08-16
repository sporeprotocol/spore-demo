import SporeService from '@/spore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const spores = await SporeService.shared.list(req.query.clusterId as string);
    res.status(200).json(spores);
  })

export default router.handler();
