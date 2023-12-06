import {
  DefaultError,
  QueryKey,
  UseQueryOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useCallback } from 'react';

export const RESPONSE_CACHE_ENABLED = process.env.NEXT_PUBLIC_RESPONSE_CACHE_ENABLED === 'true';

export function useRefreshableQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, refreshOnMount?: boolean) {
  const { queryKey, queryFn, enabled, initialData } = options;
  const queryClient = useQueryClient();

  type QueryContext = {
    queryKey: TQueryKey;
    signal: AbortSignal;
    meta: Record<string, unknown> | undefined;
  };

  const request = useCallback(
    (ctx: QueryContext, headers?: Headers) => {
      if (!ctx.meta) {
        ctx.meta = {};
      }
      if (headers) {
        ctx.meta.headers = headers;
      }
      return Promise.resolve(queryFn?.(ctx));
    },
    [queryFn],
  );

  const queryResult = useQuery({
    queryKey,
    queryFn: async (ctx) => {
      const response = await request(ctx);
      if (RESPONSE_CACHE_ENABLED && refreshOnMount) {
        const headers = new Headers();
        headers.set('Cache-Control', 'no-store');
        request(ctx, headers)
          .then((data) => {
            // @ts-ignore
            queryClient.setQueryData(queryKey, data);
          })
          .catch((e) => console.error(e));
      }
      return response;
    },
    enabled,
    initialData,
  });

  const refresh = useCallback(async () => {
    try {
      const headers = new Headers();
      headers.set('Cache-Control', 'no-store');
      await request(
        {
          queryKey,
          signal: new AbortController().signal,
          meta: {
            headers,
          },
        },
        headers,
      );
    } catch (error) {
      console.error(error);
    }
  }, [queryKey, request]);

  return {
    ...queryResult,
    refresh,
  };
}
