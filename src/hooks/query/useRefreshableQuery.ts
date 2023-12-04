import { DefaultError, QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

export function useRefreshableQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, refreshOnMount?: boolean) {
  const { queryKey, queryFn, enabled, initialData } = options;
  const headersRef = useRef<Headers>(new Headers());
  const hasRefreshOnRequestRef = useRef(false);

  const queryResult = useQuery({
    queryKey,
    queryFn: async (ctx) => {
      const fetch = () => {
        if (!ctx.meta) {
          ctx.meta = {};
        }
        ctx.meta.headers = headersRef.current;
        return Promise.resolve(queryFn?.(ctx));
      };
      const response = await fetch();
      return response;
    },
    enabled,
    initialData,
  });

  const refresh = useCallback(async () => {
    headersRef.current.set('Cache-Control', 'no-cache');
    await queryResult.refetch();
    headersRef.current.delete('Cache-Control');
  }, [queryResult]);

  useEffect(() => {
    if (refreshOnMount && !hasRefreshOnRequestRef.current) {
      hasRefreshOnRequestRef.current = true;
      refresh();
    }
  }, [refresh, refreshOnMount]);

  return {
    ...queryResult,
    refresh,
  };
}
