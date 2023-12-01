import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QueryCluster } from './type';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';

const clustersByAddressQueryDocument = graphql(`
  query GetClustersByAddress($address: String) {
    clusters(filter: { address: $address }) {
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

export function useClustersByAddressQuery(address: string) {
  const { data, ...rest } = useRefreshableQuery({
    queryKey: ['clustersByAddress', address],
    queryFn: async (ctx) =>
      graphQLClient.request(
        clustersByAddressQueryDocument,
        { address },
        ctx.meta?.headers as Headers,
      ),
    enabled: !!address,
  });
  const clusters: QueryCluster[] = data?.clusters ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: clusters,
    isLoading,
  };
}
