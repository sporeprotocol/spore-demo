import { AppShell, Container, Flex, Group, Header } from '@mantine/core';
import Logo from './Logo';
import Connect from './Connect';
import useWalletConnect from '@/hooks/useWalletConnect';
import CreateButton from './CreateButton';

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const { connected } = useWalletConnect();

  return (
    <AppShell
      padding="md"
      header={
        <Header height={60} p="xs">
          <Container>
            <Flex justify="space-between" align="center">
              <Logo />
              <Group>
                <Connect />
                {connected && <CreateButton />}
              </Group>
            </Flex>
          </Container>
        </Header>
      }
    >
      <Container>{children}</Container>
    </AppShell>
  );
}
