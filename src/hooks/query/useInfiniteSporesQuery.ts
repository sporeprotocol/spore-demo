import { graphql } from '@/gql';
import { GetInfiniteSporesQueryQuery } from '@/gql/graphql';
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
      return request('/api/graphql', infiniteSporesQueryDocument, {
        first: 12,
        after: pageParam,
      });
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
