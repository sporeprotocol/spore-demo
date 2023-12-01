import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QuerySpore } from './type';
import { useCallback, useRef } from 'react';

const clusterSporesQueryDocument = graphql(`
  query GetClusterSporesQuery($clusterId: String) {
    spores(filter: { clusterId: $clusterId }) {
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
  const headersRef = useRef<Headers>(new Headers());
  const { data, ...rest } = useQuery({
    queryKey: ['clusterSpores', id],
    queryFn: async () => {
      if (!id) {
        return undefined;
      }
      const fetch = () =>
        request('/api/graphql', clusterSporesQueryDocument, {
          clusterId: id,
        });
      const response = await fetch();
      if (headersRef.current.get('Cache-Control') !== 'no-cache') {
        headersRef.current.set('Cache-Control', 'no-cache');
        fetch().finally(() => headersRef.current.delete('Cache-Control'));
      }
      return response;
    },
    enabled: !!id,
  });
  const spores = (data?.spores as QuerySpore[]) ?? [];

  const { refetch } = rest;
  const refresh = useCallback(async () => {
    headersRef.current.set('Cache-Control', 'no-cache');
    await refetch();
    headersRef.current.delete('Cache-Control');
  }, [refetch]);

  const isLoading = rest.isLoading || rest.isPending;

  return {
    data: spores,
    isLoading,
    refresh,
  };
}
