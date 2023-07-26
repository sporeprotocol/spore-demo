import type { AppProps } from 'next/app';
import { MantineProvider } from '@mantine/core';
import { WagmiConfig, configureChains, createConfig, mainnet } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { Notifications } from '@mantine/notifications';

const { publicClient } = configureChains([mainnet], [publicProvider()]);

const config = createConfig({
  autoConnect: false,
  publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: 'light',
      }}
    >
      <WagmiConfig config={config}>
        <Notifications />
        <Component {...pageProps} />
      </WagmiConfig>
    </MantineProvider>
  );
}
