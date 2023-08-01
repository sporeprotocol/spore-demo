import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { getClusters } from '@/cluster';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (_: NextApiRequest, res: NextApiResponse) => {
    const clusters = await getClusters();
    res.status(200).json(clusters);
  })

export default router.handler();
