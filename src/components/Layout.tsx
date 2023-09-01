import {
  Box,
  MediaQuery,
  em,
  getBreakpointValue,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import MobileAppShell from './MobileAppShell';
import DefaultAppShell from './DefaultAppShell';

interface LayoutProps extends React.PropsWithChildren<{}> {
  header?: React.ReactNode;
}

export default function Layout({ children, header }: LayoutProps) {
  const theme = useMantineTheme();
  const smallerThenSM = useMediaQuery(
    `(max-width: ${em(getBreakpointValue(theme.breakpoints.sm))})`,
  );

  const AppShell = smallerThenSM ? MobileAppShell : DefaultAppShell;

  return (
    <AppShell>
      {header && <Box>{header}</Box>}
      <MediaQuery
        largerThan="xs"
        styles={{ paddingLeft: '22px', paddingRight: '22px' }}
      >
        <Box>{children}</Box>
      </MediaQuery>
    </AppShell>
  );
}
