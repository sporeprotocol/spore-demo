import { useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MobileAppShell from './MobileAppShell';
import DefaultAppShell from './DefaultAppShell';

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const theme = useMantineTheme();
  const smallerThenSM = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return smallerThenSM ? (
    <MobileAppShell>{children}</MobileAppShell>
  ) : (
    <DefaultAppShell>{children}</DefaultAppShell>
  );
}
