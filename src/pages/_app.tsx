import type { AppProps } from 'next/app';
import { Provider as JotaiProvider } from 'jotai';
import { MantineProvider, createStyles } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { Hydrate, QueryClient, QueryClientProvider } from 'react-query';
import { ModalsProvider } from '@mantine/modals';
import { useState } from 'react';
import store from '@/state/store';
import { ConnectProvider } from '@/hooks/useConnect';
import MetaMaskConnector from '@/connectors/metamask';
import { trpc } from '@/server';
import theme from '@/theme';
import JoyIdConnector from '@/connectors/joyId';

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

const useStyles = createStyles((theme) => ({
  header: {
    padding: '32px',
    paddingBottom: '16px',
    backgroundColor: theme.colors.background[0],
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: theme.headings.fontFamily,
  },
  body: {
    paddingLeft: '32px',
    paddingRight: '32px',
    paddingBottom: '32px',
  },
  content: {
    backgroundColor: theme.colors.background[0],
    borderRadius: '16px',
    borderColor: theme.colors.text[0],
    borderWidth: '1px',
    borderStyle: 'solid',
    boxShadow: '4px 4px 0 #111318',
  },
  close: {
    color: theme.colors.text[0],
  },
}));

function UIProvider({ children }: React.PropsWithChildren<{}>) {
  const { classes } = useStyles();

  return (
    <ModalsProvider
      modalProps={{
        centered: true,
        classNames: classes,
      }}
    >
      <Notifications />
      {children}
    </ModalsProvider>
  );
}

const config = {
  autoConnect: true,
  connectors: [new MetaMaskConnector(), new JoyIdConnector()],
};

function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
      <ConnectProvider value={config}>
        <StateProvider pageProps={pageProps}>
          <UIProvider>
            <Component {...pageProps} />
          </UIProvider>
        </StateProvider>
      </ConnectProvider>
    </MantineProvider>
  );
}

export default trpc.withTRPC(App);
