import {
  Text,
  Button,
  Container,
  Flex,
  Grid,
  Header as MantineHeader,
  createStyles,
  Box,
  AppShell,
  useMantineTheme,
} from '@mantine/core';
import { useConnect } from '@/hooks/useConnect';
import Logo from './Logo';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import useCreateClusterModal from '@/hooks/modal/useCreateClusterModal';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import DropMenu from './DropMenu';
import { IconPlus } from '@tabler/icons-react';
import { NAVS } from '@/constants';
import { useMediaQuery } from '@mantine/hooks';

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
  create: {
    backgroundColor: theme.colors.brand[1],

    '&:hover': {
      backgroundColor: '#7F6BD1',
    },
  },
}));

export default function DefaultAppShell(props: React.PropsWithChildren<{}>) {
  const { children } = props;
  const { classes } = useStyles();
  const { connected, connect } = useConnect();
  const router = useRouter();
  const theme = useMantineTheme();
  const smallerThenLG = useMediaQuery(`(max-width: ${theme.breakpoints.lg})`);

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
          height={80}
          p="md"
          className={classes.header}
          withBorder={false}
        >
          <Container size="xl">
            <Grid align="center" mx={smallerThenLG ? '0px' : '44px'}>
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
              </Grid.Col>
              <Grid.Col span={2}>
                <Flex justify="end">
                  {connected ? (
                    <DropMenu
                      menu={[
                        {
                          key: 'mint-spore',
                          title: 'Mint a Spore',
                          onClick: mintSporeModal.open,
                        },
                        {
                          key: 'create-cluster',
                          title: 'Create a Cluster',
                          onClick: createClusterModal.open,
                        },
                      ]}
                    >
                      <Button className={classes.create}>
                        <IconPlus />
                        <Text>Create</Text>
                      </Button>
                    </DropMenu>
                  ) : (
                    <Button className={classes.connect} onClick={connect}>
                      Connect Wallet
                    </Button>
                  )}
                </Flex>
              </Grid.Col>
            </Grid>
          </Container>
        </MantineHeader>
      }
    >
      <Box bg="background.0" mih="100vh" mt="80px">
        {children}
      </Box>
    </AppShell>
  );
}
