import { BI, Indexer, helpers } from '@ckb-lumos/lumos';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  if (!address) {
    res.status(400).send('address is required');
    return;
  }

  const config = predefinedSporeConfigs.Aggron4;
  const indexer = new Indexer(config.ckbIndexerUrl);
  const collector = indexer.collector({
    lock: helpers.parseAddress(address as string, { config: config.lumos }),
    data: '0x',
  });

  let capacities = BI.from(0);
  for await (const cell of collector.collect()) {
    capacities = capacities.add(cell.cellOutput.capacity);
  }

  res.status(200).send(capacities.toHexString());
});

export default router.handler();
