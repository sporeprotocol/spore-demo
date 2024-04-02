import useCreateClusterModal from "@/hooks/modal/useCreateClusterModal";
import { useConnect } from "@/hooks/useConnect";
import useEstimatedOnChainSize from "@/hooks/useEstimatedOnChainSize";
import { SUPPORTED_MIME_TYPE, TEXT_MIME_TYPE, getMIMETypeByName, VIDEO_MIME_TYPE } from "@/utils/mime";
import { getFriendlyErrorMessage } from "@/utils/error";
import { showError, showSuccess } from "@/utils/notifications";
import { BI, config, helpers } from "@ckb-lumos/lumos";
import {
  Text,
  Box,
  Group,
  Select,
  Image,
  Button,
  ScrollArea,
  createStyles,
  useMantineTheme,
  Flex,
  MediaQuery,
  Stack,
  Tooltip,
  Checkbox,
} from "@mantine/core";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import { IconChevronDown, IconCopy } from "@tabler/icons-react";
import { useState, useCallback, forwardRef, useRef, useMemo, useEffect } from "react";
import PreviewRender from "./PreviewRender";
import { isAnyoneCanPay } from "@/utils/script";
import Popover from "./Popover";
import { QueryCluster } from "@/hooks/query/type";
import { useCapacity } from "@/hooks/query/useCapacity";

const MAX_SIZE_LIMIT = parseInt(
  // process.env.NEXT_PUBLIC_MINT_SIZE_LIMIT ?? '300',
  process.env.NEXT_PUBLIC_MINT_SIZE_LIMIT ?? "5120",
  10
);

export interface MintSporeModalProps {
  defaultClusterId?: string;
  clusters: QueryCluster[];
  onSubmit: (content: Blob | null, clusterId: string | undefined, useCapacityMargin?: boolean) => Promise<void>;
}

const useStyles = createStyles((theme) => ({
  create: {
    position: "absolute",
    bottom: "0px",
    width: "100%",
    height: "42px",
    padding: "8px 16px",
    backgroundColor: theme.white,
    cursor: "pointer",
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: theme.colors.border[0],
    borderBottomLeftRadius: "6px",
    borderBottomRightRadius: "6px",
  },
  scroll: {
    paddingBottom: "42px",
  },
  select: {
    "div[aria-expanded=true] .mantine-Select-input": {
      padding: "12px 15px",
      borderColor: theme.colors.brand[1],
      borderBottomRightRadius: "0px",
      borderBottomLeftRadius: "0px",
      borderWidth: "2px",
    },

    ".mantine-Select-item[data-hovered]": {
      backgroundColor: theme.fn.rgba("#1A202C", 0.08),
      color: theme.colors.text[0],
    },

    ".mantine-Select-item[data-selected]": {
      backgroundColor: theme.colors.background[0],
      color: theme.colors.text[0],
    },

    ".mantine-Select-separatorLabel": {
      color: theme.colors.text[1],

      "&::after": {
        borderTop: 0,
      },
    },
  },
  input: {
    height: "50px",
    padding: "12px 16px",
    fontSize: "16px",
    color: theme.colors.text[0],
    borderColor: theme.colors.text[0],
    borderWidth: "1px",
    borderRadius: "6px",

    "&:focus": {
      padding: "12px 15px",
      borderColor: theme.colors.brand[1],
      borderWidth: "2px",
    },

    "&::placeholder": {
      color: theme.colors.text[2],
      fontSize: "16px",
    },
  },
  dropdown: {
    marginTop: "-10px",
    borderTopLeftRadius: "0px",
    borderTopRightRadius: "0px",
    borderColor: theme.colors.brand[1],
    borderWidth: "2px",
    borderBottomLeftRadius: "6px",
    borderBottomRightRadius: "6px",
  },
  dropdownItem: {
    fontSize: "16px",
  },
  dropzone: {
    width: "616px",
    height: "260px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      width: "100%",
    },
  },
  mobileActions: {
    borderTop: `1px solid ${theme.colors.border[0]}`,
  },
  submit: {
    backgroundColor: theme.colors.brand[1],
    "&:hover": {
      backgroundColor: "#7F6BD1",
      borderRadius: "4px",
    },
  },
  change: {
    borderColor: theme.colors.brand[1],
    borderWidth: "2px",
    borderStyle: "solid",
    color: theme.colors.brand[1],
    boxShadow: "none !important",
  },
}));

const DropdownContainer: React.ForwardRefRenderFunction<any, React.PropsWithChildren<{}>> = (props, ref) => {
  const { classes } = useStyles();
  const { children, ...restProps } = props;
  const createClusterModal = useCreateClusterModal();

  return (
    <ScrollArea ref={ref} classNames={{ root: classes.scroll }} {...restProps}>
      {children}
      <Box className={classes.create} onClick={createClusterModal.open}>
        <Text color="text.0">+ Create new Cluster</Text>
      </Box>
    </ScrollArea>
  );
};
const DropdownContainerRef = forwardRef(DropdownContainer);

export default function MintVideoSporeModal(props: MintSporeModalProps) {
  const { defaultClusterId, clusters, onSubmit } = props;
  const theme = useMantineTheme();
  const { address, getAnyoneCanPayLock } = useConnect();
  const clipboard = useClipboard();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const dropzoneOpenRef = useRef<() => void>(null);
  const [clusterId, setClusterId] = useState<string | undefined>(defaultClusterId);
  const [content, setContent] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [useCapacityMargin, setUseCapacityMargin] = useState(true);
  const onChainSize = useEstimatedOnChainSize(clusterId, content, useCapacityMargin);
  const { classes } = useStyles();
  const { data: capacity = "0x0" } = useCapacity(address);

  const balance = useMemo(() => {
    if (!capacity) return 0;
    return Math.floor(BI.from(capacity).toNumber() / 10 ** 8);
  }, [capacity]);

  const isImageType = useMemo(() => {
    if (!content) return false;
    const mimeType = content.type || getMIMETypeByName(content.name);
    return IMAGE_MIME_TYPE.includes(mimeType as any);
  }, [content]);

  const isVideoType = useMemo(() => {
    if (!content) return false;
    const mimeType = content.type || getMIMETypeByName(content.name);
    return VIDEO_MIME_TYPE.includes(mimeType as any);
  }, [content]);

  const isTextType = useMemo(() => {
    if (!content) return false;
    const mimeType = content.type || getMIMETypeByName(content.name);
    return TEXT_MIME_TYPE.includes(mimeType as any);
  }, [content]);

  useEffect(() => {
    if (onChainSize > balance) {
      setError(new Error("Insufficient balance"));
    } else {
      if (error?.message === "Insufficient balance") {
        setError(null);
      }
    }
  }, [onChainSize, balance]);

  const handleDrop: DropzoneProps["onDrop"] = useCallback((files) => {
    const [file] = files;
    setError(null);
    setContent(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit(content, clusterId, useCapacityMargin);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [onSubmit, clusterId, content, useCapacityMargin]);

  const selectableClusters = useMemo(() => {
    const ownerClusters = clusters.filter((cluster) => {
      if (!address || !cluster.cell) {
        return false;
      }

      const clusterAddress = helpers.encodeToAddress(cluster.cell.cellOutput.lock, {
        config: config.predefined.AGGRON4,
      });
      if (clusterAddress === address) return true;

      const acpAddress = helpers.encodeToAddress(getAnyoneCanPayLock(), {
        config: config.predefined.AGGRON4,
      });
      return clusterAddress === acpAddress;
    });

    const publicClusters = clusters.filter((cluster) => {
      const lock = cluster.cell?.cellOutput.lock;
      return isAnyoneCanPay(lock) && !ownerClusters.some((c) => c.id === cluster.id);
    });

    return [
      ...ownerClusters.map(({ id, name }) => ({
        value: id,
        label: name,
        group: "My Clusters",
      })),
      ...publicClusters.map(({ id, name }) => ({
        value: id,
        label: name,
        group: "All Public Clusters",
      })),
    ];
  }, [clusters, getAnyoneCanPayLock, address]);

  return (
    <Box>
      <Flex direction="column" mb="24px">
        <Flex align="center">
          <Text color="text.0" mr="5px">
            Address:
          </Text>
          <Text color="text.0" weight="700" mr="5px">
            {address.slice(0, 10)}...{address.slice(-10)}
          </Text>
          <Flex
            sx={{ cursor: "pointer" }}
            onClick={() => {
              clipboard.copy(address);
              showSuccess("Copied!");
            }}
          >
            <Tooltip label={clipboard.copied ? "Copied" : "Copy"} withArrow>
              <IconCopy size="17px" color={theme.colors.text[0]} />
            </Tooltip>
          </Flex>
        </Flex>
        <Flex>
          <Text color="text.0" mr="5px">
            Balance:
          </Text>
          <Text color="text.0" weight="700">
            {balance.toLocaleString("en-US")} CKB
          </Text>
        </Flex>
      </Flex>
      <Select
        mb="md"
        maxDropdownHeight={200}
        dropdownPosition="bottom"
        placeholder="Select a Cluster (optional)"
        rightSection={<IconChevronDown color={theme.colors.text[0]} />}
        classNames={{
          root: classes.select,
          input: classes.input,
          dropdown: classes.dropdown,
          item: classes.dropdownItem,
        }}
        data={selectableClusters}
        value={clusterId}
        onChange={(id) => setClusterId(id || undefined)}
        dropdownComponent={DropdownContainerRef}
        disabled={loading}
        searchable
      />

      {content ? (
        <Stack>
          <PreviewRender content={content} />
          <Group position="apart">
            <Group spacing="8px">
              {isImageType && <Image src="/images/image.png" alt="image" width="40" height="48" />}
              {isVideoType && <Image src="/images/video.jpeg" alt="image" width="40" height="48" />}
              {isTextType && <Image src="/images/text.png" alt="image" width="40" height="48" />}
              <Stack spacing={0}>
                <Text weight="bold" color="text.0">
                  {content.name.length > 20
                    ? `${content.name.slice(0, 10)}...${content.name.slice(-10)}`
                    : content.name}
                </Text>
                <Text size="sm" color="text.1">
                  {content.size.toLocaleString("en-US")} CKB
                </Text>
              </Stack>
            </Group>
            {!isMobile && (
              <Text
                color="brand.1"
                weight="bold"
                sx={{ cursor: "pointer" }}
                onClick={() => !loading && dropzoneOpenRef.current?.()}
              >
                Change File
              </Text>
            )}
          </Group>
        </Stack>
      ) : (
        <Dropzone
          openRef={dropzoneOpenRef}
          onDrop={handleDrop}
          classNames={{ root: classes.dropzone }}
          accept={SUPPORTED_MIME_TYPE}
          onReject={(e) => {
            const [{ file, errors }] = e;
            const mimeType = getMIMETypeByName(file.name);
            if (SUPPORTED_MIME_TYPE.includes(mimeType as any)) {
              handleDrop([file]);
              return;
            }
            const [error] = errors;
            showError(error.message);
          }}
          maxSize={MAX_SIZE_LIMIT * 1000}
        >
          <Flex direction="column" align="center">
            <Image src="/images/upload.png" mb="24px" alt="upload" width="90" height="85" />
            <Flex align="center" mb="16px">
              <MediaQuery smallerThan="sm" styles={{ textAlign: "center" }}>
                <Text size="xl">
                  Drag or
                  <Text component="span" size="xl" color="brand.1" sx={{ textDecoration: "underline" }} mx="5px" inline>
                    upload
                  </Text>
                  an video here
                </Text>
              </MediaQuery>
            </Flex>
            <Text size="sm" color="text.1">
              Supported formats: MP4, WEBM, OGG, QUICKTIME
            </Text>
            <Text size="sm" color="text.1">
              The file cannot exceed {MAX_SIZE_LIMIT / 1024} MB
            </Text>
          </Flex>
        </Dropzone>
      )}
      {content && (
        <>
          <Flex direction="column" mt="18px" mb="8px">
            <Flex align="center">
              <Text color="text.0" mr="5px">
                Estimated On-chain Size:
              </Text>
              <Text weight="bold" color="text.0" mr="5px">
                ≈ {onChainSize.toLocaleString("en-US")} CKB
              </Text>
              <Popover label="By creating a spore, you are reserving this amount of CKByte for on-chain storage. You can always melt spores to redeem your reserved CKByte.">
                <Image src="/svg/icon-info.svg" alt="info" width="20" height="20" />
              </Popover>
            </Flex>
          </Flex>
          {onChainSize <= balance && (
            <Flex direction="column" my="8px">
              <Flex align="center">
                <Text color="text.0" mr="5px">
                  Remaining Balance:
                </Text>
                <Text weight="bold" color="text.0" mr="5px">
                  ≈ {(balance - onChainSize).toLocaleString("en-US")} CKB
                </Text>
              </Flex>
            </Flex>
          )}
        </>
      )}
      {error && (
        <Text size="sm" color="functional.0">
          {getFriendlyErrorMessage(error.message)}
        </Text>
      )}
      {!isMobile ? (
        <Group position="apart" mt="32px">
          <Group spacing="xs">
            <Checkbox
              id="zero-fee"
              sx={{ cursor: "pointer" }}
              checked={useCapacityMargin}
              onChange={(e) => setUseCapacityMargin(e.target.checked)}
            />
            <label style={{ cursor: "pointer" }} htmlFor="zero-fee">
              Enable Zero-Fee Transfers
            </label>
            <Popover label="By checking this option, you allocate 1 CKByte to sponsor future transfers, covering around 100,000 transfers. You can manage this feature on this Spore's info page.">
              <Image src="/svg/icon-info.svg" alt="info" width="20" height="20" />
            </Popover>
          </Group>
          <Button className={classes.submit} disabled={!content} loading={loading} onClick={handleSubmit}>
            Mint
          </Button>
        </Group>
      ) : (
        <Stack mt="16px" pt="16px" className={classes.mobileActions}>
          <Group spacing="xs">
            <Checkbox checked={useCapacityMargin} onChange={(e) => setUseCapacityMargin(e.target.checked)} />
            <Text>Enable Zero-Fee Transfers</Text>
            <Popover label="By checking this option, you allocate 1 CKByte to sponsor future transfers, covering around 100,000 transfers. You can manage this feature on this Spore's info page.">
              <Image src="/svg/icon-info.svg" alt="info" width="20" height="20" />
            </Popover>
          </Group>
          {content && (
            <Button
              className={classes.change}
              variant="outline"
              onClick={() => dropzoneOpenRef.current?.()}
              loading={loading}
              fullWidth
            >
              Change Image
            </Button>
          )}
          <Button
            className={classes.submit}
            disabled={!content || !!error}
            onClick={handleSubmit}
            loading={loading}
            fullWidth
          >
            Mint
          </Button>
        </Stack>
      )}
    </Box>
  );
}
