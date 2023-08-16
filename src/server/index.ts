import { httpLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import { AppRouter } from './routers';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/v1/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});
