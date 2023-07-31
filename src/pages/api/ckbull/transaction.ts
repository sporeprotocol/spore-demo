import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthentication } from './_authentication';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { transactionToken } = req.query;
    const response = await fetch(
      `${process.env.CKBULL_API_URL}/transaction-request/${transactionToken}`,
      {
        method: 'GET',
        // @ts-ignore
        headers: getAuthentication(),
      },
    );
    console.log(
      `${process.env.CKBULL_API_URL}/sign-in-requests/${transactionToken}`,
    );
    const data = await response.json();
    res.status(response.status).json(data);
  })
  .post(async (req: NextApiRequest, res: NextApiResponse) => {
    const { signInToken, transaction } = JSON.parse(req.body);
    const { transactionToken } = await fetch(
      `${process.env.CKBULL_API_URL}/transaction-request`,
      {
        method: 'POST',
        body: JSON.stringify({ signInToken, transaction }),
        // @ts-ignore
        headers: getAuthentication(),
      },
    ).then((res) => res.json());

    res.status(200).json({
      transactionToken,
    });
  });

export default router.handler();
