import { graphql } from '@/gql';
import { GetInfiniteSporesQueryQuery } from '@/gql/graphql';
import { graphQLClient } from '@/utils/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import request from 'graphql-request';

const infiniteSporesQueryDocument = graphql(`
  query GetInfiniteSporesQuery($first: Int, $after: String) {
    spores(first: $first, after: $after) {
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

export function useInfiniteSporesQuery() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['infiniteSpores'],
    queryFn: async ({ pageParam }) => {
      const params = { first: 12, after: pageParam };
      const response = await graphQLClient.request(
        infiniteSporesQueryDocument,
        params,
      );
      const headers = new Headers();
      headers.set('cache-control', 'no-cache');
      graphQLClient.request(infiniteSporesQueryDocument, params, headers);
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
