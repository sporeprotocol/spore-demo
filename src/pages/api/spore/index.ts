import { getSpores } from '@/utils/spore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const spores = await getSpores(req.query.clusterId as string);
    res.status(200).json(spores);
  })

export default router.handler();
