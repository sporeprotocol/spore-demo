import { graphql } from '@/gql';
import { GetInfiniteClustersQueryQuery } from '@/gql/graphql';
import { graphQLClient } from '@/utils/graphql';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';
import { useInfiniteQuery } from '@tanstack/react-query';
import { RESPONSE_CACHE_ENABLED } from './useRefreshableQuery';

const infiniteClustersQueryDocument = graphql(`
  query GetInfiniteClustersQuery(
    $first: Int
    $after: String
    $contentTypes: [String!]
    $mintableBy: String
  ) {
    clusters: topClusters(first: $first, after: $after, filter: { mintableBy: $mintableBy }) {
      id
      name
      description
      capacityMargin
      spores(filter: { contentTypes: $contentTypes }) {
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

export function useInfiniteClustersQuery(address?: string) {
  const queryResult = useInfiniteQuery({
    queryKey: ['infiniteClusters', address],
    queryFn: async ({ pageParam }) => {
      const params = {
        first: 12,
        after: pageParam,
        contentTypes: SUPPORTED_MIME_TYPE,
        mintableBy: address,
      };
      const response = await graphQLClient.request(infiniteClustersQueryDocument, params);
      if (RESPONSE_CACHE_ENABLED) {
        const headers = new Headers();
        headers.set('cache-control', 'no-cache');
        graphQLClient
          .request(infiniteClustersQueryDocument, params, headers)
          .finally(() => headers.delete('cache-control'));
      }
      return response;
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage: GetInfiniteClustersQueryQuery) => {
      const { clusters = [] } = lastPage;
      return clusters?.[clusters.length - 1]?.id;
    },
  });

  return queryResult;
}
