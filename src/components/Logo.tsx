import { Title } from '@mantine/core';
import Link from 'next/link';
import { Caveat_Brush } from 'next/font/google';

const caveatBrush = Caveat_Brush({ subsets: ['latin'], weight: ['400'] });

export default function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', color: '#0a0a0a' }}>
      <Title className={caveatBrush.className} order={2}>
        Spore Demo
      </Title>
    </Link>
  );
}
