import { graphql } from '@/gql';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { context, server } from '../graphql';
import { GetSporeContentQueryQuery } from '@/gql/graphql';

const router = createRouter<NextApiRequest, NextApiResponse>();

const sporeContentQuery = graphql(`
  query GetSporeContentQuery($id: String!) {
    spore(id: $id) {
      id
      content
      contentType
    }
  }
`);

router.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const response = await server.executeOperation<GetSporeContentQueryQuery>(
    {
      query: sporeContentQuery,
      variables: {
        id,
      },
    },
    {
      contextValue: context,
    },
  );

  const { body } = response;
  if (body.kind !== 'single' || body.singleResult.errors) {
    res.status(404).end();
    return;
  }
  const data = body.singleResult.data;

  if (!data || !data.spore) {
    res.status(404).end();
    return;
  }

  const buffer = Buffer.from(data.spore.content!.slice(2), 'hex');
  res.setHeader('Content-Type', data.spore.contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.status(200).send(buffer);
});

export default router.handler();
