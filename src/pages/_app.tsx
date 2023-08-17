import type { AppProps } from 'next/app';
import { Provider as JotaiProvider } from 'jotai';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ModalsProvider } from '@mantine/modals';
import { useState } from 'react';
import store from '@/state/store';
import { ConnectProvider } from '@/hooks/useConnect';
import MetaMaskConnector from '@/connectors/metamask';
import { trpc } from '@/server';
import theme from '@/theme';

function StateProvider({
  children,
  pageProps,
}: React.PropsWithChildren<{
  pageProps: AppProps['pageProps'];
}>) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>{children}</Hydrate>
      </QueryClientProvider>
    </JotaiProvider>
  );
}

function UIProvider({ children }: React.PropsWithChildren<{}>) {
  return (
    <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
      <ModalsProvider>
        <Notifications />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}

const config = {
  autoConnect: true,
  connectors: [new MetaMaskConnector()],
};

function App({ Component, pageProps }: AppProps) {
  return (
    <ConnectProvider value={config}>
      <StateProvider pageProps={pageProps}>
        <UIProvider>
          <Component {...pageProps} />
        </UIProvider>
      </StateProvider>
    </ConnectProvider>
  );
}

export default trpc.withTRPC(App);
