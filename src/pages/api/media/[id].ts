import { getSpore } from '@/utils/spore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  const spore = await getSpore(id as string);
  if (!spore) {
    res.status(404).end();
    return;
  }

  const buffer = Buffer.from(spore.content.slice(2), 'hex');
  res.setHeader('Content-Type', spore.contentType);
  res.setHeader(
    'Cache-Control',
    'public, max-age=31536000',
  );
  res.status(200).send(buffer);
});

export default router.handler();
