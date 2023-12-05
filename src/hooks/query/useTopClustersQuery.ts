import { graphql } from '@/gql';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';

const topClustersQueryDocument = graphql(`
  query GetTopClustersQuery($first: Int, $contentTypes: [String!]) {
    topClusters(first: $first) {
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

export function useTopClustersQuery(limit = 4) {
  const { data, ...rest } = useRefreshableQuery(
    {
      queryKey: ['topClusters'],
      queryFn: async (ctx) =>
        graphQLClient.request(
          topClustersQueryDocument,
          { first: limit, contentTypes: SUPPORTED_MIME_TYPE },
          ctx.meta?.headers as Headers,
        ),
    },
    true,
  );
  const clusters = data?.topClusters ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    data: clusters,
    isLoading,
  };
}
