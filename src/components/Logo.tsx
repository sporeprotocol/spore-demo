import Link from 'next/link';
import Image from 'next/image';
import { useMediaQuery } from '@mantine/hooks';
import { useMantineTheme } from '@mantine/core';

export default function Logo() {
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Link href="/" style={{ textDecoration: 'none', color: '#0a0a0a' }}>
      <Image
        src="/svg/logo.svg"
        alt="Spore Demo"
        width={isMobile ? '95' : '126'}
        height="24"
      />
    </Link>
  );
}
