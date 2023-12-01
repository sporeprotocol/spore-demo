import { GraphQLClient } from 'graphql-request';

export const graphQLClient = new GraphQLClient('/api/graphql', {
  fetch: (input: RequestInfo | URL, init?: RequestInit | undefined) => {
    return fetch(input, {
      ...init,
      next: {
        revalidate: false,
      },
    });
  },
});
