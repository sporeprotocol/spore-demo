import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QuerySpore } from './type';

const sporeQueryDocument = graphql(`
  query GetSporeQuery($id: String!) {
    spore(id: $id) {
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
      }
    }
  }
`);

export function useSporeQuery(id: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['spore', id],
    queryFn: async () =>
      request('/api/graphql', sporeQueryDocument, { id: id! }),
    enabled: !!id,
  });
  const spore = data?.spore as QuerySpore | undefined;
  return {
    data: spore,
    isLoading,
  };
}
