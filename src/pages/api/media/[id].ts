import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { predefinedSporeConfigs, unpackToRawSporeData } from '@spore-sdk/core';
import { Indexer } from '@ckb-lumos/lumos';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const indexer = new Indexer(predefinedSporeConfigs.Aggron4.ckbIndexerUrl);
  const collector = indexer.collector({
    type: {
      ...predefinedSporeConfigs.Aggron4.scripts.Spore.script,
      args: id as string,
    },
  });

  for await (const cell of collector.collect()) {
    const spore = unpackToRawSporeData(cell.data);

    const buffer = Buffer.from(spore.content.toString().slice(2), 'hex');
    res.setHeader('Content-Type', spore.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.status(200).send(buffer);
  }

  res.status(404).end();
});

export default router.handler();
