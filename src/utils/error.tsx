import { Flex, Text } from '@mantine/core';
import Link from 'next/link';

export function getFriendlyErrorMessage(message: string) {
  switch (message) {
    case 'Not enough capacity in from infos!': {
      return (
        <>
          Not enough CKB in your wallet. You can get some CKB from{' '}
          <Link href="https://faucet.nervos.org" target="_blank">
            Nervos Pudge Faucet
          </Link>{' '}
          or use another wallet.
        </>
      );
    }
    case 'Unable to open a popup for loginWithPopup - window.open returned `null`': {
      return (
        <Flex direction="column" mb="md">
          <Text>
            Unable to open popup window, please check browser settings.
          </Text>
          <Text>
            {'- For iOS Safari: On your iPhone or iPad, go to Settings > Safari, Turn off Block Pop-ups.'}
          </Text>
          <Text>
            - For MacOS Safari: <Link href="https://support.apple.com/en-ph/guide/safari/sfri40696/mac">Allow pop-ups in Safari on Mac</Link>
          </Text>
          <Text>
            - For Other Browsers: See <Link href="https://www.wikihow.com/Allow-Pop%E2%80%93ups">How to Allow Pop-ups</Link>
          </Text>
        </Flex>
      );
    }
    default:
      return message;
  }
}
