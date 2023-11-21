import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';

const clusterSporesQueryDocument = graphql(`
  query GetClusterSporesQuery($clusterId: String) {
    spores(filter: { clusterId: $clusterId }) {
      id
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
      }
    }
  }
`);

export function useClusterSporesQuery(id: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['clusterSpores', id],
    queryFn: async () => {
      if (!id) {
        return undefined;
      }
      return request('/api/graphql', clusterSporesQueryDocument, {
        clusterId: id,
      });
    },
    enabled: !!id,
  });
  return {
    data,
    isLoading,
  };
}
