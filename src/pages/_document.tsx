import { Html, Head, Main, NextScript } from 'next/document'
import { createGetInitialProps } from '@mantine/next';

export const getInitialProps = createGetInitialProps();

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
