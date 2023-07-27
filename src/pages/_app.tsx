import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { Notifications } from '@mantine/notifications';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { useState } from 'react';

const { publicClient } = configureChains([mainnet], [publicProvider()]);

const config = createConfig({
  autoConnect: false,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: 'light',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <WagmiConfig config={config}>
            <Notifications />
            <Component {...pageProps} />
          </WagmiConfig>
        </Hydrate>
      </QueryClientProvider>
    </MantineProvider>
  );
}
