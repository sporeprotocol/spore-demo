import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QuerySpore } from './type';
import { useCallback, useRef } from 'react';

const sporesByAddressQueryDocument = graphql(`
  query GetSporesByAddress($address: String) {
    spores(filter: { address: $address }) {
      id
      clusterId
      contentType
    }
  }
`);

export function useSporesByAddressQuery(address: string) {
  const headersRef = useRef<Headers>(new Headers());

  const { data, ...rest } = useQuery({
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
