import { graphql } from '@/gql';
import { QueryCluster } from './type';
import { graphQLClient } from '@/utils/graphql';
import { useRefreshableQuery } from './useRefreshableQuery';

const mintableClustersQueryDocument = graphql(`
  query GetMintableClusterQuery($address: String!) {
    clusters: mintableClusters(address: $address) {
      id
      name
      description
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

export function useMintableClustersQuery(address: string | undefined) {
  const { data, ...rest } = useRefreshableQuery(
    {
      queryKey: ['mintableClusters', address],
      queryFn: async (ctx) => {
        return graphQLClient.request(
          mintableClustersQueryDocument,
          { address: address! },
          ctx.meta?.headers as Headers,
        );
      },
      enabled: !!address,
    },
    true,
  );
  const clusters = data?.clusters as QueryCluster[] | undefined;
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: clusters,
    isLoading,
  };
}
