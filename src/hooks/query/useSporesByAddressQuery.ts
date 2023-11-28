import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QuerySpore } from './type';
import { useRef } from 'react';

const sporesByAddressQueryDocument = graphql(`
  query GetSporesByAddress($address: String) {
    spores(filter: { address: $address }) {
      id
      clusterId
      contentType
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
  const headersRef = useRef<Headers>(new Headers());
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sporesByAddress', address],
    queryFn: async () =>
      request(
        '/api/graphql',
        sporesByAddressQueryDocument,
        { address },
        headersRef.current,
      ),
    enabled: !!address,
  });
  const spores: QuerySpore[] = data?.spores ?? [];

  async function refresh() {
    headersRef.current.set('Cache-Control', 'no-cache');
    await refetch();
    headersRef.current.delete('Cache-Control');
  }

  return {
    data: spores,
    isLoading,
    refresh,
  };
}
