import {
  Container,
  Flex,
  Grid,
  Header as MantineHeader,
  createStyles,
  useMantineTheme,
  Burger,
  AppShell,
  Navbar,
  Box,
  Text,
  Button,
  Drawer,
} from '@mantine/core';
import { useConnect } from '@/hooks/useConnect';
import Logo from './Logo';
import useCreateClusterModal from '@/hooks/modal/useCreateClusterModal';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import { useMemo, useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { NAVS } from '@/constants';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DropMenu from './DropMenu';
import { useDisclosure } from '@mantine/hooks';

const useStyles = createStyles((theme) => ({
  burger: {
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A202C',

    '&:hover': {
      backgroundColor: '#2C323D',
    },
  },
  header: {
    height: '56px',
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },
  navbar: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.brand[0],
  },
  connect: {
    backgroundColor: '#1A202C',

    '&:hover': {
      backgroundColor: '#2C323D',
    },
  },
  nav: {
    fontSize: '16px',
    lineHeight: 1.6,
    color: theme.colors.text[1],
    padding: '11px 0px',
  },
  active: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1.6,
    color: theme.colors.text[0],
    padding: '11px 0px',
    position: 'relative',
    display: 'inline-block',

    '&::after': {
      content: '""',
      width: '24px',
      height: '24px',
      position: 'absolute',
      left: '100%',
      transform: 'translateX(8px)',
      backgroundImage: 'url(/svg/arrow-return-left.svg)',
    },
  },
  create: {
    backgroundColor: theme.colors.brand[1],

    '&:hover': {
      backgroundColor: '#7F6BD1',
    },
  },
  drawerContent: {
    borderTopRightRadius: '8px',
    borderTopLeftRadius: '8px',
    background: theme.colors.background[0],
    boxShadow: '0px -4px 0px 0px #1A202C',
  },
  drawerHeader: {
    padding: '8px 10px',
    background: theme.colors.background[0],
    borderBottom: `1px solid ${theme.colors.text[0]}`,
    display: 'flex',
    justifyContent: 'center',
  },
  drawerTitle: {
    fontWeight: 'bold',
    color: theme.colors.text[0],
    lineHeight: 1.6,
  },
  drawerBody: {
    padding: 0,
  },
}));

export default function MobileAppShell(props: React.PropsWithChildren<{}>) {
  const { classes } = useStyles();
  const { children } = props;
  const router = useRouter();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [drawerOpened, drawer] = useDisclosure(false);
  const { connect, connected } = useConnect();

  const createClusterModal = useCreateClusterModal();
  const mintSporeModal = useMintSporeModal();

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
        <MantineHeader
          height={56}
          p="8px"
          className={classes.header}
          withBorder={false}
        >
          <Container size="xl">
            <Grid h="56px" align="center">
              <Grid.Col span={6} p={0}>
                <Flex justify="start">
                  <Logo />
                </Flex>
              </Grid.Col>
              <Grid.Col span={6} p={0}>
                <Flex justify="end">
                  <Burger
                    className={classes.burger}
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.white}
                  />
                </Flex>
              </Grid.Col>
            </Grid>
          </Container>
        </MantineHeader>
      }
      navbar={
        <Navbar
          className={classes.navbar}
          hiddenBreakpoint="sm"
          hidden={!opened}
        >
          {connected ? (
            <>
              <Drawer
                opened={drawerOpened}
                overlayProps={{
                  color: '#E0E0E0',
                  opacity: 0.7,
                }}
                classNames={{
                  content: classes.drawerContent,
                  body: classes.drawerBody,
                }}
                styles={{
                  header: { display: 'none' },
                }}
                onClose={drawer.close}
                size="150px"
                position="bottom"
              >
                <Flex h="42px" className={classes.drawerHeader}>
                  <Text className={classes.drawerTitle}>Create</Text>
                </Flex>
                <Box
                  px="16px"
                  py="12px"
                  onClick={() => {
                    drawer.close();
                    mintSporeModal.open();
                  }}
                >
                  <Text>Mint a Spore</Text>
                </Box>
                <Box
                  px="16px"
                  py="12px"
                  onClick={() => {
                    drawer.close();
                    createClusterModal.open();
                  }}
                >
                  <Text>Create a Cluster</Text>
                </Box>
              </Drawer>
              <Button className={classes.create} onClick={drawer.open}>
                <IconPlus />
                <Text>Create</Text>
              </Button>
            </>
          ) : (
            <Button className={classes.connect} onClick={connect}>
              Connect Wallet
            </Button>
          )}
          <Box mt="md">
            <Flex direction="column" justify="center">
              {navs.map((nav) => (
                <Link
                  key={nav.name}
                  href={nav.href}
                  target={nav.target}
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
          </Box>
        </Navbar>
      }
    >
      <Box bg="background.0" mih="100vh" mt="56px">
        {children}
      </Box>
    </AppShell>
  );
}
