import { graphql } from '@/gql';
import { QuerySpore } from './type';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';

const clusterSporesQueryDocument = graphql(`
  query GetClusterSporesQuery($clusterId: String!, $contentTypes: [String!]) {
    spores(filter: { clusterIds: [$clusterId], contentTypes: $contentTypes }) {
      id
      contentType
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

export function useClusterSporesQuery(id: string | undefined) {
  const { data, ...rest } = useRefreshableQuery({
    queryKey: ['clusterSpores', id],
    queryFn: async (ctx) => {
      if (!id) {
        return undefined;
      }
      return graphQLClient.request(
        clusterSporesQueryDocument,
        {
          clusterId: id,
          contentTypes: SUPPORTED_MIME_TYPE,
        },
        ctx.meta?.headers as Headers,
      );
    },
    enabled: !!id,
  });
  const spores = (data?.spores as QuerySpore[]) ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: spores,
    isLoading,
  };
}
