import { Title } from '@mantine/core';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', color: '#0a0a0a' }}>
      <Title order={2}>SporeDemo</Title>
    </Link>
  );
}
