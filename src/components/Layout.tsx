import { AppShell, Container, Flex, Group, Header } from '@mantine/core';
import Logo from './Logo';
import Connect from './Connect';
import CreateButton from './CreateButton';
import { useConnect } from '@/hooks/useConnect';

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const { connected } = useConnect();

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
