import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link href="/" style={{ textDecoration: 'none', color: '#0a0a0a' }}>
      <Image src="/svg/logo.svg" alt="Spore Demo" width="126" height="24" />
    </Link>
  );
}
