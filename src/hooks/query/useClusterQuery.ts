import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QueryCluster } from './type';

const clusterQueryDocument = graphql(`
  query GetClusterQuery($id: String!) {
    cluster(id: $id) {
      id
      name
      description
      capacityMargin
      spores {
        id
        contentType
        cell {
          cellOutput {
            capacity
            lock {
              args
              codeHash
              hashType
            }
          }
        }
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
      }
    }
  }
`);

export function useClusterQuery(id: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['cluster', id],
    queryFn: async () =>
      request('/api/graphql', clusterQueryDocument, { id: id! }),
    enabled: !!id,
  });
  const cluster = data?.cluster as QueryCluster | undefined;
  return {
    data: cluster,
    isLoading,
  };
}
