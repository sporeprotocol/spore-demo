import { DefaultError, QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

export const RESPONSE_CACHE_ENABLED = process.env.NEXT_PUBLIC_RESPONSE_CACHE_ENABLED === 'true';

export function useRefreshableQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, refreshOnMount?: boolean) {
  const { queryKey, queryFn, enabled, initialData } = options;
  const headersRef = useRef<Headers>(new Headers());
  const hasRefreshOnRequestRef = useRef(false);

  const fetch = useCallback(
    (ctx: any) => {
      if (!ctx.meta) {
        ctx.meta = {};
      }
      ctx.meta.headers = headersRef.current;
      return Promise.resolve(queryFn?.(ctx));
    },
    [queryFn],
  );

  const queryResult = useQuery({
    queryKey,
    queryFn: async (ctx) => fetch(ctx),
    enabled,
    initialData,
  });

  const refresh = useCallback(async () => {
    headersRef.current.set('Cache-Control', 'no-cache');
    await fetch({});
    headersRef.current.delete('Cache-Control');
  }, [fetch]);

  useEffect(() => {
    if (!RESPONSE_CACHE_ENABLED) {
      return;
    }

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
