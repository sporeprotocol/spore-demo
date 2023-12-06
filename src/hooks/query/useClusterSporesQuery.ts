import { graphql } from '@/gql';
import { QuerySpore } from './type';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';

const clusterSporesQueryDocument = graphql(`
  query GetClusterSporesQuery($first: Int, $clusterId: String!, $contentTypes: [String!]) {
    spores(first: $first, filter: { clusterIds: [$clusterId], contentTypes: $contentTypes }) {
      id
      contentType
      capacityMargin
      clusterId
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

export function useClusterSporesQuery(id: string | undefined, enabled = true) {
  const { data, ...rest } = useRefreshableQuery(
    {
      queryKey: ['clusterSpores', id],
      queryFn: async (ctx) => {
        if (!id) {
          return undefined;
        }
        return graphQLClient.request(
          clusterSporesQueryDocument,
          {
            first: 9999,
            clusterId: id,
            contentTypes: SUPPORTED_MIME_TYPE,
          },
          ctx.meta?.headers as Headers,
        );
      },
      enabled: !!id && enabled,
    },
    true,
  );
  const spores = (data?.spores as QuerySpore[]) ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: spores,
    isLoading,
  };
}
