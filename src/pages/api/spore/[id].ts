import { getSpore } from '@/utils/spore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const spore = await getSpore(id as string);
  res.status(200).json(spore);
});

export default router.handler();