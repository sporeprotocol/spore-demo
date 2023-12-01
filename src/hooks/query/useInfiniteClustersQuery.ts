import { graphql } from '@/gql';
import { GetInfiniteClustersQueryQuery } from '@/gql/graphql';
import { useInfiniteQuery } from '@tanstack/react-query';
import request from 'graphql-request';

const infiniteClustersQueryDocument = graphql(`
  query GetInfiniteClustersQuery($first: Int, $after: String) {
    clusters(first: $first, after: $after) {
      id
      name
      description
      capacityMargin
      spores {
        id
        clusterId
        contentType
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

export function useInfiniteClustersQuery() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['infiniteClusters'],
    queryFn: async ({ pageParam }) => {
      return request('/api/graphql', infiniteClustersQueryDocument, {
        first: 12,
        after: pageParam,
      });
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetInfiniteClustersQueryQuery) => {
      const { clusters = [] } = lastPage;
      return clusters?.[clusters.length - 1]?.id;
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
