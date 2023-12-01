import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QuerySpore } from './type';
import { useCallback, useRef } from 'react';

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
  const headersRef = useRef<Headers>(new Headers());

  const { data, ...rest } = useQuery({
    queryKey: ['sporesByAddress', address],
    queryFn: async () => {
      const fetch = () =>
        request(
          '/api/graphql',
          sporesByAddressQueryDocument,
          { address },
          headersRef.current,
        );
      const response = await fetch();
      if (headersRef.current.get('Cache-Control') !== 'no-cache') {
        headersRef.current.set('Cache-Control', 'no-cache');
        fetch().finally(() => headersRef.current.delete('Cache-Control'));
      }
      return response;
    },
    enabled: !!address,
  });
  const spores: QuerySpore[] = data?.spores ?? [];

  const { refetch } = rest;
  const refresh = useCallback(async () => {
    headersRef.current.set('Cache-Control', 'no-cache');
    await refetch();
    headersRef.current.delete('Cache-Control');
  }, [refetch]);

  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: spores,
    refresh,
    isLoading,
  };
}
