import { graphql } from '@/gql';
import { QuerySpore } from './type';
import { graphQLClient } from '@/utils/graphql';
import { useRefreshableQuery } from './useRefreshableQuery';

const sporesByAddressQueryDocument = graphql(`
  query GetSporesByAddress($address: String) {
    spores(filter: { address: $address }) {
      id
      contentType
      capacityMargin
      cluster {
        id
        name
        description
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

export function useSporesByAddressQuery(address: string) {
  const { data, ...rest } = useRefreshableQuery({
    queryKey: ['sporesByAddress', address],
    queryFn: async (ctx) => {
      return graphQLClient.request(
        sporesByAddressQueryDocument,
        { address },
        ctx.meta?.headers as Headers,
      );
    },
    enabled: !!address,
  });
  const spores: QuerySpore[] = data?.spores ?? [];
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: spores,
    isLoading,
  };
}
