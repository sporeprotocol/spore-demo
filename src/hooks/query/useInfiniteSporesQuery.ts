import { graphql } from '@/gql';
import { GetInfiniteSporesQueryQuery } from '@/gql/graphql';
import { graphQLClient } from '@/utils/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import { RESPONSE_CACHE_ENABLED } from './useRefreshableQuery';

const infiniteSporesQueryDocument = graphql(`
  query GetInfiniteSporesQuery($first: Int, $after: String, $contentTypes: [String!]) {
    spores(first: $first, after: $after, filter: { contentTypes: $contentTypes }) {
      id
      contentType
      capacityMargin
      cluster {
        id
        name
        description
      }
      cell {
        cellOutput {
          capacity
          lock {
            args
            codeHash
            hashType
          }
        }
        outPoint {
          txHash
          index
        }
      }
    }
  }
`);

export function useInfiniteSporesQuery(contentTypes?: string[]) {
  const { data, error, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['infiniteSpores', contentTypes],
      queryFn: async ({ pageParam }) => {
        const params = { first: 12, after: pageParam, contentTypes };
        const response = await graphQLClient.request(infiniteSporesQueryDocument, params);
        if (RESPONSE_CACHE_ENABLED) {
          const headers = new Headers();
          headers.set('cache-control', 'no-cache');
          graphQLClient
            .request(infiniteSporesQueryDocument, params, headers)
            .finally(() => headers.delete('cache-control'));
        }
        return response;
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage: GetInfiniteSporesQueryQuery) => {
        const { spores = [] } = lastPage;
        return spores?.[spores.length - 1]?.id;
      },
    });

  return {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  };
}
