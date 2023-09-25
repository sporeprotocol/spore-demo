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
import Head from 'next/head';
import { cache } from '@/utils/cache';
import { GlobalOpenGraph } from '@/components/OpenGraph';
import { GoogleAnalytics } from 'nextjs-google-analytics';

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

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      padding: '24px',
    },
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

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      paddingLeft: '24px',
      paddingRight: '24px',
      paddingBottom: '24px',
    },
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
      <Notifications position="bottom-center" limit={1} />
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
    <>
      <Head>
        <title>Spore Demo</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/images/favicon.png" />
      </Head>
      <MantineProvider
        withNormalizeCSS
        withGlobalStyles
        theme={theme}
        emotionCache={cache}
      >
        <ConnectProvider value={config}>
          <StateProvider pageProps={pageProps}>
            <UIProvider>
              <GlobalOpenGraph />
              <GoogleAnalytics trackPageViews />
              <Component {...pageProps} />
            </UIProvider>
          </StateProvider>
        </ConnectProvider>
      </MantineProvider>
    </>
  );
}

export default trpc.withTRPC(App);
