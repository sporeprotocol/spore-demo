import { graphql } from '@/gql';
import { QueryCluster } from './type';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';

const clusterQueryDocument = graphql(`
  query GetClusterQuery($id: String!) {
    cluster(id: $id) {
      id
      name
      description
      capacityMargin
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

export function useClusterQuery(id: string | undefined) {
  const { data, ...rest } = useRefreshableQuery({
    queryKey: ['cluster', id],
    queryFn: async (ctx) => {
      return graphQLClient.request(
        clusterQueryDocument,
        { id: id!, contentTypes: SUPPORTED_MIME_TYPE },
        ctx.meta?.headers as Headers,
      );
    },
    enabled: !!id,
  });
  const cluster = data?.cluster as QueryCluster | undefined;
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: cluster,
    isLoading,
  };
}
