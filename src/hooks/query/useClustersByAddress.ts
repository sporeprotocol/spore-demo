import { graphql } from '@/gql';
import { QueryCluster } from './type';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';

const clustersByAddressQueryDocument = graphql(`
  query GetClustersByAddress($address: String!, $contentTypes: [String!]) {
    clusters(filter: { addresses: [$address] }) {
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

export function useClustersByAddressQuery(address: string | undefined) {
  const { data, ...rest } = useRefreshableQuery(
    {
      queryKey: ['clustersByAddress', address],
      queryFn: async (ctx) =>
        graphQLClient.request(
          clustersByAddressQueryDocument,
          { address: address!, contentTypes: SUPPORTED_MIME_TYPE },
          ctx.meta?.headers as Headers,
        ),
      enabled: !!address,
    },
    true,
  );
  const clusters: QueryCluster[] = data?.clusters ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: clusters,
    isLoading,
  };
}
