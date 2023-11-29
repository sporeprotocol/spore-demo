import { graphql } from '@/gql';
import request from 'graphql-request';
import { useQuery } from '@tanstack/react-query';
import { QuerySpore } from './type';
import { useRef } from 'react';

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
        outPoint {
          txHash
          index
        }
      }
    }
  }
`);

export function useSporeQuery(
  id: string | undefined,
  initialData?: QuerySpore,
) {
  const headersRef = useRef<Headers>(new Headers());
  const { data, ...rest } = useQuery({
    queryKey: ['spore', id],
    queryFn: async () => {
      return request(
        '/api/graphql',
        sporeQueryDocument,
        { id: id! },
        headersRef.current,
      );
    },
    enabled: !!id,
    placeholderData: {
      spore: initialData,
    },
  });
  const spore = data?.spore as QuerySpore | undefined;

  const refresh = async () => {
    headersRef.current.set('Cache-Control', 'no-cache');
    await rest.refetch();
    headersRef.current.delete('Cache-Control');
  };

  const isLoading = rest.isLoading || rest.isPending;

  return {
    ...rest,
    data: spore,
    isLoading,
    refresh,
  };
}
