import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QueryCluster } from './type';
import { useRef } from 'react';

const clusterQueryDocument = graphql(`
  query GetClusterQuery($id: String!) {
    cluster(id: $id) {
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

export function useClusterQuery(
  id: string | undefined,
  initialData?: QueryCluster,
) {
  const headersRef = useRef<Headers>(new Headers());
  const { data, ...rest } = useQuery({
    queryKey: ['cluster', id],
    queryFn: async () => {
      const fetch = () =>
        request('/api/graphql', clusterQueryDocument, { id: id! });
      const response = await fetch();
      if (headersRef.current.get('Cache-Control') !== 'no-cache') {
        headersRef.current.set('Cache-Control', 'no-cache');
        fetch().finally(() => headersRef.current.delete('Cache-Control'));
        headersRef.current.delete('Cache-Control');
      }
      return response;
    },
    enabled: !!id,
    placeholderData: {
      cluster: initialData,
    },
  });
  const cluster = data?.cluster as QueryCluster | undefined;
  const isLoading = rest.isLoading || rest.isPending;

  const refresh = async () => {
    headersRef.current.set('Cache-Control', 'no-cache');
    await rest.refetch();
    headersRef.current.delete('Cache-Control');
  };

  return {
    ...rest,
    data: cluster,
    isLoading,
    refresh,
  };
}
