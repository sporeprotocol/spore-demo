import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthentication } from './_authentication';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { transactionToken } = req.query;
    const data = await fetch(
      `${process.env.CKBULL_API_URL}/transaction-request/${encodeURIComponent(transactionToken as string)}`,
      {
        method: 'GET',
        // @ts-ignore
        headers: getAuthentication(),
      },
    ).then((res) => res.json());
    res.status(200).json(data);
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { signInToken, transaction } = JSON.parse(req.body);
    const data = await fetch(
      `${process.env.CKBULL_API_URL}/transaction-request`,
      {
        method: 'POST',
        body: JSON.stringify({ signInToken, transaction }),
        // @ts-ignore
        headers: getAuthentication(),
      },
    ).then((res) => res.json());

    res.status(200).json(data);
  });

export default router.handler();
