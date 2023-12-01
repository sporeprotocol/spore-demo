import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';

const topClustersQueryDocument = graphql(`
  query GetTopClustersQuery($first: Int) {
    topClusters(first: $first) {
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

export function useTopClustersQuery(limit = 4) {
  const { data, ...rest } = useRefreshableQuery({
    queryKey: ['topClusters'],
    queryFn: async (ctx) =>
      graphQLClient.request(
        topClustersQueryDocument,
        { first: limit },
        ctx.meta?.headers as Headers,
      ),
  });
  const clusters = data?.topClusters ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    data: clusters,
    isLoading,
  };
}
