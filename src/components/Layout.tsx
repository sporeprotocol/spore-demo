import { AppShell, Container, Flex, Header } from '@mantine/core';
import Logo from './Logo';
import ConnectButton from './ConnectButton';

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Container>
            <Flex justify="space-between" align="center">
              <Logo />
              <ConnectButton />
            </Flex>
          </Container>
        </Header>
      }
    >
      <Container>{children}</Container>
    </AppShell>
  );
}
