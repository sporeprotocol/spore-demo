import { Box, MediaQuery, useMantineTheme } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import MobileAppShell from "./MobileAppShell";
import DefaultAppShell from "./DefaultAppShell";

interface LayoutProps extends React.PropsWithChildren<{}> {
  header?: React.ReactNode;
}

export default function Layout({ children, header }: LayoutProps) {
  const theme = useMantineTheme();
  const isMobileOrTablet = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);

  const AppShell = isMobileOrTablet ? MobileAppShell : DefaultAppShell;

  return (
    <AppShell>
      {header && <Box>{header}</Box>}
      <Box>{children}</Box>
    </AppShell>
  );
}
