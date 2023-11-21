import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';

const sporeQueryDocument = graphql(`
  query GetSporeQuery($id: String!) {
    spore(id: $id) {
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

export function useSporeQuery(id: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['spore', id],
    queryFn: async () => request('/api/graphql', sporeQueryDocument, { id }),
    enabled: !!id,
  });
  return {
    data,
    isLoading,
  };
}
