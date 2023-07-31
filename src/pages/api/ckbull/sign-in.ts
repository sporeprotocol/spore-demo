import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthentication } from './_authentication';
import { createRouter } from 'next-connect';

const router = createRouter<NextApiRequest, NextApiResponse>();

router
  .get(async (req: NextApiRequest, res: NextApiResponse) => {
    const { signInToken } = req.query;
    const response = await fetch(
      `${process.env.CKBULL_API_URL}/sign-in-requests/${encodeURIComponent(
        signInToken as string,
      )}`,
      {
        method: 'GET',
        // @ts-ignore
        headers: getAuthentication(),
      },
    );
    const data = await response.json();
    res.status(response.status).json(data);
  })
  .post(async (_: NextApiRequest, res: NextApiResponse) => {
    const { signInToken } = await fetch(
      `${process.env.CKBULL_API_URL}/sign-in-requests`,
      {
        method: 'POST',
        // @ts-ignore
        headers: getAuthentication(),
      },
    ).then((res) => res.json());
    res.status(200).json({ signInToken });
  });

export default router.handler();
