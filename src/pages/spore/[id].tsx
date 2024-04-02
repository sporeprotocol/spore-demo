import "react-loading-skeleton/dist/skeleton.css";
import Layout from "@/components/Layout";
import {
  Text,
  Image,
  Container,
  Title,
  useMantineTheme,
  Box,
  Group,
  Stack,
  Tooltip,
  createStyles,
} from "@mantine/core";
import { useRouter } from "next/router";
import Link from "next/link";
import { BI, config, helpers } from "@ckb-lumos/lumos";
import { IconCopy } from "@tabler/icons-react";
import { useConnect } from "@/hooks/useConnect";
import Skeleton from "react-loading-skeleton";
import useTransferSporeModal from "@/hooks/modal/useTransferSporeModal";
import useMeltSporeModal from "@/hooks/modal/useMeltSporeModal";
import { useMemo } from "react";
import Head from "next/head";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import { SporeOpenGraph } from "@/components/OpenGraph";
import { showSuccess } from "@/utils/notifications";
import SporeContentRender from "@/components/SporeContentRender";
import Popover from "@/components/Popover";
import useSponsorSporeModal from "@/hooks/modal/useSponsorSporeModal";
import { useSporeQuery } from "@/hooks/query/useSporeQuery";
import { useClusterSporesQuery } from "@/hooks/query/useClusterSporesQuery";

export const useStyles = createStyles((theme) => ({
  image: {
    width: "100%",
    height: "100%",
    maxWidth: "468px",
    maxWeight: "468px",
    borderRadius: "8px",
    borderColor: theme.colors.text[0],
    borderStyle: "solid",
    borderWidth: "1px",
    boxShadow: "4px 4px 0 #111318",
    backgroundColor: theme.colors.background[1],
    overflow: "hidden",

    [theme.fn.smallerThan("sm")]: {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
  title: {
    textOverflow: "ellipsis",
    maxWidth: "100%",
    wordBreak: "break-all",
  },
}));

export default function SporePage() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useMantineTheme();
  const { connected, address, getAnyoneCanPayLock } = useConnect();
  const clipboard = useClipboard({ timeout: 500 });
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const { classes } = useStyles();

  const { data: spore, isLoading: isSporeLoading } = useSporeQuery(id as string);
  const isLoading = isSporeLoading || !spore;

  const { data: spores } = useClusterSporesQuery(spore?.cluster?.id || undefined);

  const transferSpore = useTransferSporeModal(spore);
  const meltSpore = useMeltSporeModal(spore);
  const sponsorSpore = useSponsorSporeModal(spore);

  const amount = spore?.cell ? BI.from(spore.cell.cellOutput.capacity).toNumber() / 10 ** 8 : 0;
  const owner = spore?.cell
    ? helpers.encodeToAddress(spore.cell.cellOutput.lock, {
        config: config.predefined.AGGRON4,
      })
    : "";

  const nextSporeIndex = useMemo(() => (spores ?? []).findIndex((sp) => sp.id === id) + 1, [spores, id]);
  const prevSporeIndex = useMemo(() => (spores ?? []).findIndex((sp) => sp.id === id) - 1, [spores, id]);

  const isOwner = useMemo(() => {
    if (!connected) {
      return false;
    }

    if (address === owner) {
      return true;
    }
    const acpAddress = helpers.encodeToAddress(getAnyoneCanPayLock(), {
      config: config.predefined.AGGRON4,
    });
    if (acpAddress === owner) {
      return true;
    }
    return false;
  }, [connected, address, owner, getAnyoneCanPayLock]);

  const txHash = spore?.cell?.outPoint?.txHash ?? "";
  // console.log(spore);

  const pager = spore?.cluster && spores && spores.length > 1 && (
    <Group position="apart">
      {prevSporeIndex >= 0 && (
        <Link href={`/spore/${spores[prevSporeIndex].id}`} style={{ textDecoration: "none" }} prefetch>
          <Image src="/svg/icon-left.svg" width="24" height="24" alt="Previus Spore" />
        </Link>
      )}
      {nextSporeIndex < spores.length && (
        <Link href={`/spore/${spores[nextSporeIndex].id}`} style={{ textDecoration: "none" }} prefetch>
          <Image src="/svg/icon-right.svg" width="24" height="24" alt="Previus Spore" />
        </Link>
      )}
    </Group>
  );

  return (
    <Layout>
      <Head>
        <title>Spore: {id} - Spore Demo</title>
      </Head>
      <SporeOpenGraph spore={spore} />
      <Box bg="background.0">
        <Container size="md" pt="24px" pb="24px">
          <Stack spacing="24px">
            {spore?.cluster && (
              <Group position="apart">
                <Link href={`/cluster/${spore.cluster.id}`} style={{ textDecoration: "none" }}>
                  <Group spacing="8px">
                    <Image src="/svg/icon-layers.svg" alt="Cluster Icon" width="24px" height="24px" />
                    <Text
                      size="lg"
                      color="text.0"
                      weight="bold"
                      sx={{
                        fontFamily: theme.headings.fontFamily,
                      }}
                    >
                      {spore.cluster.name}
                    </Text>
                    {spores.length > 0 && (
                      <Text color="text.0">
                        ({nextSporeIndex}/{spores.length})
                      </Text>
                    )}
                  </Group>
                </Link>
                {pager}
              </Group>
            )}
            <Group>
              {isLoading ? (
                <Skeleton baseColor={theme.colors.background[1]} height="32px" width="400px" borderRadius="16px" />
              ) : (
                <Group>
                  <Box className={classes.title}>
                    <Tooltip label={`Unique ID of Spore`} withArrow>
                      {id && (
                        <Text
                          size="32px"
                          weight="bold"
                          color="text.0"
                          sx={{
                            fontFamily: theme.headings.fontFamily,
                            lineHeight: 1.3,
                          }}
                        >
                          {id.slice(0, 10)}...{id.slice(-10)}
                        </Text>
                      )}
                    </Tooltip>
                  </Box>
                  <Tooltip label={"View on explorer"} withArrow>
                    <Link href={`https://pudge.explorer.nervos.org/transaction/${txHash}`} target="_blank">
                      <Image src="/svg/icon-global.svg" alt="Transfer" width="24px" height="24px" />
                    </Link>
                  </Tooltip>
                  {isOwner && (
                    <>
                      <Tooltip label={"Transfer"} withArrow>
                        <Box sx={{ cursor: "pointer" }} onClick={transferSpore.open}>
                          <Image src="/svg/icon-repeat.svg" alt="Transfer" width="24px" height="24px" />
                        </Box>
                      </Tooltip>
                      <Tooltip label={"Sponsor Spore"} withArrow>
                        <Box sx={{ cursor: "pointer" }} onClick={sponsorSpore.open}>
                          <Image
                            src="/svg/icon-add-capacity.svg"
                            fit="contain"
                            alt="sponsor"
                            width="24px"
                            height="24px"
                          />
                        </Box>
                      </Tooltip>
                      <Tooltip label={"Melt"} withArrow>
                        <Box sx={{ cursor: "pointer" }} onClick={meltSpore.open}>
                          <Image src="/svg/icon-trash-2.svg" alt="Melt" width="24px" height="24px" />
                        </Box>
                      </Tooltip>
                    </>
                  )}
                </Group>
              )}
            </Group>
            <Group>
              {isLoading ? (
                <Skeleton baseColor={theme.colors.background[1]} height="40px" width="200px" borderRadius="16px" />
              ) : (
                <Popover
                  label={`The amount of CKByte occupied on-chain, redeemable upon melt`}
                  width={320}
                  position="bottom-start"
                >
                  <Title
                    order={2}
                    bg="brand.0"
                    px="8px"
                    sx={{
                      display: "inline",
                    }}
                  >
                    {amount.toLocaleString("en-US")} CKByte
                  </Title>
                </Popover>
              )}
            </Group>
            <Group spacing={isMobile ? "24px" : "48px"}>
              <Stack spacing="4px">
                <Text size="lg" color="text.0" weight="bold">
                  Content Type
                </Text>
                {isLoading ? (
                  <Skeleton baseColor={theme.colors.background[1]} height="22px" width="100px" borderRadius="16px" />
                ) : (
                  <Group>
                    <Text color="text.0">{spore!.contentType}</Text>
                  </Group>
                )}
              </Stack>
              <Stack spacing="4px">
                <Text size="lg" color="text.0" weight="bold">
                  Owned by
                </Text>
                {isLoading ? (
                  <Skeleton baseColor={theme.colors.background[1]} height="22px" width="300px" borderRadius="16px" />
                ) : (
                  <Group>
                    <Text component="span">
                      {address === owner ? (
                        <Text component="span">
                          <Text component="span" size="lg">
                            Me (
                          </Text>
                          <Link href={`/my`} style={{ textDecoration: "none" }}>
                            <Text component="span" color="brand.1">
                              {owner.slice(0, 10)}...{owner.slice(-10)}
                            </Text>
                          </Link>
                          <Text component="span" size="lg">
                            )
                          </Text>
                        </Text>
                      ) : (
                        <Link href={`/${owner}`} style={{ textDecoration: "none" }}>
                          <Text color="brand.1">
                            {owner.slice(0, 10)}...{owner.slice(-10)}
                          </Text>
                        </Link>
                      )}
                    </Text>
                    <Text
                      component="span"
                      sx={{ cursor: "pointer" }}
                      onClick={() => {
                        clipboard.copy(owner);
                        showSuccess("Copied!");
                      }}
                      h="22px"
                      ml="5px"
                    >
                      <Tooltip label={clipboard.copied ? "Copied" : "Copy"} withArrow>
                        <IconCopy size="22px" color={theme.colors.text[0]} />
                      </Tooltip>
                    </Text>
                  </Group>
                )}
              </Stack>
            </Group>
          </Stack>
        </Container>
      </Box>
      <Container size="md" pt="48px" pb="24px">
        <SporeContentRender spore={spore} />
      </Container>
    </Layout>
  );
}
