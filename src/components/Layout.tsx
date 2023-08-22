import {
  Text,
  AppShell,
  Button,
  Container,
  Flex,
  Grid,
  Header,
  createStyles,
  Box,
} from '@mantine/core';
import { useConnect } from '@/hooks/useConnect';
import Logo from './Logo';
import CreateButton from './CreateButton';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

const useStyles = createStyles((theme) => ({
  connect: {
    backgroundColor: '#1A202C',

    '&:hover': {
      backgroundColor: '#2C323D',
    },
  },
  header: {
    height: '80px',
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },
  nav: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1.6,
    color: theme.colors.text[1],
  },
  active: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1.6,
    color: theme.colors.text[0],
    position: 'relative',

    '&::after': {
      content: '""',
      width: '78px',
      height: '10px',
      position: 'absolute',
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundImage: 'url(/svg/nav-indicator.svg)',
    },
  },
}));

type NavItem = {
  name: string;
  href: string;
  paths?: string[];
  needConnect?: boolean;
};

const NAVS: NavItem[] = [
  {
    name: 'Explore',
    href: '/',
  },
  {
    name: 'My Space',
    href: '/my',
    needConnect: true,
  },
  {
    name: 'What is Spore?',
    href: 'https://spore.pro',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/sporeprotocol/spore-demo',
  },
];

export default function Layout({ children }: React.PropsWithChildren<{}>) {
  const { classes } = useStyles();
  const { connected, connect } = useConnect();
  const router = useRouter();

  const navs = useMemo(() => {
    if (!connected) {
      return NAVS.filter((nav) => !nav.needConnect);
    }
    return NAVS;
  }, [connected]);

  return (
    <AppShell
      padding="none"
      header={
        <Header
          height={80}
          p="md"
          className={classes.header}
          withBorder={false}
        >
          <Container size="xl">
            <Grid align="center" mx="44px">
              <Grid.Col span={2}>
                <Flex justify="start">
                  <Logo />
                </Flex>
              </Grid.Col>
              <Grid.Col span={8}>
                <Flex justify="center" gap="50px">
                  {navs.map((nav) => (
                    <Link
                      key={nav.name}
                      href={nav.href}
                      style={{ textDecoration: 'none' }}
                    >
                      <Text
                        className={
                          nav.href === router.pathname
                            ? classes.active
                            : classes.nav
                        }
                      >
                        {nav.name}
                      </Text>
                    </Link>
                  ))}
                </Flex>
              </Grid.Col>
              <Grid.Col span={2}>
                <Flex justify="end">
                  {connected ? (
                    <CreateButton />
                  ) : (
                    <Button className={classes.connect} onClick={connect}>
                      Connect Wallet
                    </Button>
                  )}
                </Flex>
              </Grid.Col>
            </Grid>
          </Container>
        </Header>
      }
    >
      <Box bg="background.0" mih="100vh">
        {children}
      </Box>
    </AppShell>
  );
}
