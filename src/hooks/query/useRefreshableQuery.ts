import { DefaultError, QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { throttle } from 'lodash-es';
import { useCallback, useRef } from 'react';

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
    queryFn: async (ctx) => {
      const response = await fetch(ctx);
      if (RESPONSE_CACHE_ENABLED && refreshOnMount && !hasRefreshOnRequestRef.current) {
        hasRefreshOnRequestRef.current = true;
        headersRef.current.set('Cache-Control', 'no-cache');
        fetch({})
          .catch((e) => console.error(e))
          .finally(() => {
            headersRef.current.delete('Cache-Control');
          });
      }
      return response;
    },
    enabled,
    initialData,
  });

  const refresh = useCallback(async () => {
    try {
      headersRef.current.set('Cache-Control', 'no-cache');
      await fetch({});
      headersRef.current.delete('Cache-Control');
    } catch (error) {
      // catch refresh request error and remove cache-control header
      // to avoid subsequent requests to be no-cache
      headersRef.current.delete('Cache-Control');
      console.error(error);
    }
  }, [fetch]);

  return {
    ...queryResult,
    refresh: throttle(refresh, 300),
  };
}
