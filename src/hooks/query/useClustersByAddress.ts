import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QueryCluster } from './type';

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
  const { data, ...rest } = useQuery({
    queryKey: ['clustersByAddress', address],
    queryFn: async () =>
      request('/api/graphql', clustersByAddressQueryDocument, { address }),
    enabled: !!address,
  });
  const clusters: QueryCluster[] = data?.clusters ?? [];
  return {
    ...rest,
    data: clusters,
  };
}
