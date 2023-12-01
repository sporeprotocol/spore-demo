import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QueryCluster } from './type';
import { useRef } from 'react';
import { useRefreshableQuery } from './useRefreshableQuery';
import { graphQLClient } from '@/utils/graphql';

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

export function useClusterQuery(id: string | undefined) {
  const { data, ...rest } = useRefreshableQuery({
    queryKey: ['cluster', id],
    queryFn: async (ctx) => {
      return graphQLClient.request(
        clusterQueryDocument,
        { id: id! },
        ctx.meta?.headers as Headers,
      );
    },
    enabled: !!id,
  });
  const cluster = data?.cluster as QueryCluster | undefined;
  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: cluster,
    isLoading,
  };
}
