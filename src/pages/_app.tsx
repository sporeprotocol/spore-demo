import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { Notifications } from '@mantine/notifications';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ModalsProvider } from '@mantine/modals';
import { useState } from 'react';

const { publicClient } = configureChains([mainnet], [publicProvider()]);

const config = createConfig({
  autoConnect: false,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider
        withNormalizeCSS
        theme={{
          colorScheme: 'light',
        }}
      >
        <ModalsProvider>
          <Hydrate state={pageProps.dehydratedState}>
            <WagmiConfig config={config}>
              <Notifications />
              <Component {...pageProps} />
            </WagmiConfig>
          </Hydrate>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
