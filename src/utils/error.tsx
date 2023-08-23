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
    default:
      return message;
  }
}
