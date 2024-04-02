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
  MediaQuery,
  Center,
  Divider,
} from "@mantine/core";
import Image from "next/image";
import { useConnect } from "@/hooks/useConnect";
import Logo from "./Logo";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import useCreateClusterModal from "@/hooks/modal/useCreateClusterModal";
import useMintSporeModal from "@/hooks/modal/useMintSporeModal";
import useMintVideoSporeModal from "@/hooks/modal/useMintVideoSporeModal";
import DropMenu, { DropMenuProps } from "./DropMenu";
import { IconCopy, IconPlus } from "@tabler/icons-react";
import { NAVS } from "@/constants";
import { BI } from "@ckb-lumos/lumos";
import { useClipboard } from "@mantine/hooks";
import { showSuccess } from "@/utils/notifications";
import { useCapacity } from "@/hooks/query/useCapacity";

const useStyles = createStyles((theme) => ({
  connect: {
    backgroundColor: "#1A202C",

    "&:hover": {
      backgroundColor: "#2C323D",
    },
  },
  header: {
    height: "80px",
    backgroundImage: "url(/images/noise-on-yellow.png)",
  },
  nav: {
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.6,
    color: theme.colors.text[1],
  },
  active: {
    fontSize: "16px",
    fontWeight: 700,
    lineHeight: 1.6,
    color: theme.colors.text[0],
    position: "relative",

    "&::after": {
      content: '""',
      width: "78px",
      height: "10px",
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundImage: "url(/svg/nav-indicator.svg)",
    },
  },
  create: {
    backgroundColor: theme.colors.brand[1],

    "&:hover": {
      backgroundColor: "#7F6BD1",
    },
  },
  profile: {
    paddingLeft: "16px !important",
    paddingRight: "16px !important",
    paddingTop: "10px !important",
    paddingBottom: "10px !important",
    backgroundColor: "#1A202C",

    "&:hover": {
      backgroundColor: "#2C323D",
    },
  },
  avatar: {
    width: "26px",
    height: "26px",
    borderRadius: "22px",
    border: `2px solid ${theme.white}`,
  },
}));

export default function DefaultAppShell(props: React.PropsWithChildren<{}>) {
  const { children } = props;
  const { classes } = useStyles();
  const { connected, connect, address, disconnect, connector } = useConnect();
  const clipboard = useClipboard();
  const router = useRouter();

  useEffect(() => {
    if (!address) return;
    // @ts-ignore
    import("jazzicon").then((jazzicon) => {
      const avatarEl = jazzicon.default(22, address);
      const avatar = document.getElementById("wallet-avatar");
      if (avatar) {
        avatar.innerHTML = "";
        avatar.appendChild(avatarEl);
      }
    });
  }, [address]);

  const { data: capacity = "0x0" } = useCapacity(address);
  const createClusterModal = useCreateClusterModal();
  const mintSporeModal = useMintSporeModal();
  const mintVideoSporeModal = useMintVideoSporeModal();

  const navs = useMemo(() => {
    if (!connected) {
      return NAVS.filter((nav) => !nav.needConnect);
    }
    return NAVS;
  }, [connected]);

  const createMenu = useMemo(() => {
    return [
      {
        type: "item",
        key: "mint-spore",
        title: "Mint a Spore",
        onClick: mintSporeModal.open,
      },
      {
        type: "item",
        key: "mint-video-spore",
        title: "Mint a Video Spore",
        onClick: mintVideoSporeModal.open,
      },
      {
        type: "item",
        key: "create-cluster",
        title: "Create a Cluster",
        onClick: createClusterModal.open,
      },
    ] as DropMenuProps["menu"];
  }, [createClusterModal, mintSporeModal, mintVideoSporeModal]);

  const profileMenu = useMemo(() => {
    if (!connected) return [];
    return [
      {
        type: "item",
        key: "address",
        title: (
          <Flex align="center" justify="space-between">
            <Flex align="center" gap="xs">
              <Image src={connector!.icon} alt={connector!.type} width="24" height="24" />
              <Text size="md">
                {address.slice(0, 10)}...{address.slice(-10)}
              </Text>
            </Flex>
            <IconCopy size={18} />
          </Flex>
        ),
        onClick: () => {
          clipboard.copy(address);
          showSuccess("Copied!");
        },
      },
      {
        type: "item",
        key: "my-space",
        title: (
          <Flex align="center" gap="xs">
            <Image src="/svg/icon-user.svg" alt="user" width="24" height="24" />
            <Text size="md">My Space</Text>
          </Flex>
        ),
        onClick: () => router.push(`/my`),
      },
      {
        type: "divider",
      },
      {
        type: "item",
        key: "disconnect",
        title: (
          <Flex align="center" gap="xs">
            <Image src="/svg/icon-log-out.svg" alt="disconnect" width="24" height="24" />
            <Text size="md">Disconnect</Text>
          </Flex>
        ),
        onClick: () => disconnect(),
      },
    ] as DropMenuProps["menu"];
  }, [router, disconnect, address, connected, connector, clipboard]);

  const balance = useMemo(() => {
    if (!capacity) return 0;
    return Math.floor(BI.from(capacity).toNumber() / 10 ** 8);
  }, [capacity]);

  return (
    <AppShell
      padding="none"
      header={
        <MantineHeader height={80} p="md" className={classes.header} withBorder={false}>
          <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
            <Container size="xl">
              <Center>
                <Grid align="center" w="1200px">
                  <Grid.Col span={4}>
                    <Flex justify="start">
                      <Logo />
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Flex justify="center" gap="50px">
                      {navs.map((nav) => (
                        <Link key={nav.name} href={nav.href} target={nav.target} style={{ textDecoration: "none" }}>
                          <Text className={nav.href === router.pathname ? classes.active : classes.nav}>
                            {nav.name}
                          </Text>
                        </Link>
                      ))}
                    </Flex>
                  </Grid.Col>
                  <Grid.Col span={4}>
                    <Flex justify="end" gap="md">
                      {connected ? (
                        <DropMenu menu={createMenu}>
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
                      {connected && (
                        <DropMenu width={260} menu={profileMenu}>
                          <Button className={classes.profile}>
                            <Box mr="4px">
                              <Image src="/svg/icon-wallet.svg" alt="wallet" width="24" height="24" />
                            </Box>
                            <Text>{balance.toLocaleString("en-US")} CKB</Text>
                            <Divider mx="md" size="sm" orientation="vertical" />
                            <Box className={classes.avatar} id="wallet-avatar" />
                          </Button>
                        </DropMenu>
                      )}
                    </Flex>
                  </Grid.Col>
                </Grid>
              </Center>
            </Container>
          </MediaQuery>
        </MantineHeader>
      }
    >
      <Box mih="100vh" mt="80px">
        {children}
      </Box>
    </AppShell>
  );
}
