import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';

const clusterQueryDocument = graphql(`
  query GetClusterQuery($id: String!) {
    cluster(id: $id) {
      id
      name
      description
      spores {
        id
        contentType
        cell {
          cellOutput {
            capacity
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

export function useClusterQuery(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['cluster', id],
    queryFn: async () => request('/api/graphql', clusterQueryDocument, { id }),
    enabled: !!id,
  });
  return {
    data,
    isLoading,
  };
}
