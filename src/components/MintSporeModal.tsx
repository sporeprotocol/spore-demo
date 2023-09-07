import { Cluster } from '@/cluster';
import useCreateClusterModal from '@/hooks/modal/useCreateClusterModal';
import { useConnect } from '@/hooks/useConnect';
import useEstimatedOnChainSize from '@/hooks/useEstimatedOnChainSize';
import { SUPPORTED_MIME_TYPE } from '@/utils/mime';
import { trpc } from '@/server';
import { getFriendlyErrorMessage } from '@/utils/error';
import { showError, showSuccess } from '@/utils/notifications';
import { BI } from '@ckb-lumos/lumos';
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
  Popover,
  Tooltip,
} from '@mantine/core';
import { Dropzone, DropzoneProps } from '@mantine/dropzone';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { IconChevronDown, IconCopy } from '@tabler/icons-react';
import { useState, useCallback, forwardRef, useRef, useMemo } from 'react';
import { ImagePreviewRender } from './renders/image';

const MAX_SIZE_LIMIT = parseInt(
  process.env.NEXT_PUBLIC_MINT_SIZE_LIMIT ?? '300',
  10,
);

export interface MintSporeModalProps {
  defaultClusterId?: string;
  clusters: Cluster[];
  onSubmit: (
    content: Blob | null,
    clusterId: string | undefined,
  ) => Promise<void>;
}

const useStyles = createStyles((theme) => ({
  create: {
    position: 'absolute',
    bottom: '0px',
    width: '100%',
    height: '42px',
    padding: '8px 16px',
    backgroundColor: theme.white,
    cursor: 'pointer',
    borderTopWidth: '1px',
    borderTopStyle: 'solid',
    borderTopColor: theme.colors.border[0],
    borderBottomLeftRadius: '6px',
    borderBottomRightRadius: '6px',
  },
  scroll: {
    paddingBottom: '42px',
  },
  select: {
    'div[aria-expanded=true] .mantine-Select-input': {
      padding: '12px 15px',
      borderColor: theme.colors.brand[1],
      borderBottomRightRadius: '0px',
      borderBottomLeftRadius: '0px',
      borderWidth: '2px',
    },

    '.mantine-Select-item[data-hovered]': {
      backgroundColor: theme.fn.rgba('#1A202C', 0.08),
      color: theme.colors.text[0],
    },

    '.mantine-Select-item[data-selected]': {
      backgroundColor: theme.colors.background[0],
      color: theme.colors.text[0],
    },
  },
  input: {
    height: '50px',
    padding: '12px 16px',
    fontSize: '16px',
    color: theme.colors.text[0],
    borderColor: theme.colors.text[0],
    borderWidth: '1px',
    borderRadius: '6px',

    '&:focus': {
      padding: '12px 15px',
      borderColor: theme.colors.brand[1],
      borderWidth: '2px',
    },

    '&::placeholder': {
      color: theme.colors.text[2],
      fontSize: '16px',
    },
  },
  dropdown: {
    marginTop: '-10px',
    borderTopLeftRadius: '0px',
    borderTopRightRadius: '0px',
    borderColor: theme.colors.brand[1],
    borderWidth: '2px',
    borderBottomLeftRadius: '6px',
    borderBottomRightRadius: '6px',
  },
  dropdownItem: {
    fontSize: '16px',
  },
  dropzone: {
    width: '616px',
    height: '260px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submit: {
    backgroundColor: theme.colors.brand[1],
    '&:hover': {
      backgroundColor: '#7F6BD1',
      borderRadius: '4px',
    },
  },
  popover: {
    backgroundColor: theme.colors.brand[1],
    border: 'none',
    boxShadow: '4px 4px 0 #111318',
  },
  arrow: {
    backgroundColor: theme.colors.brand[1],
    border: 'none',
    boxShadow: '4px 2px 0 #111318, 1px 2px 0 #111318',
  },
}));

const DropdownContainer: React.ForwardRefRenderFunction<
  any,
  React.PropsWithChildren<{}>
> = (props, ref) => {
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

export default function MintSporeModal(props: MintSporeModalProps) {
  const { defaultClusterId, clusters, onSubmit } = props;
  const theme = useMantineTheme();
  const { address } = useConnect();
  const clipboard = useClipboard();
  const dropzoneOpenRef = useRef<() => void>(null);
  const [clusterId, setClusterId] = useState<string | undefined>(
    defaultClusterId,
  );
  const [content, setContent] = useState<Blob | null>(null);
  const [opened, { close, open }] = useDisclosure(false);
  const onChainSize = useEstimatedOnChainSize(clusterId, content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { classes } = useStyles();

  const { data: capacity = '0' } = trpc.accout.balance.useQuery({ address });
  const balance = useMemo(() => {
    if (!capacity) return 0;
    return Math.floor(BI.from(capacity).toNumber() / 10 ** 8);
  }, [capacity]);

  const handleDrop: DropzoneProps['onDrop'] = useCallback((files) => {
    const [file] = files;
    setContent(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      await onSubmit(content, clusterId);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [onSubmit, clusterId, content]);

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
            sx={{ cursor: 'pointer' }}
            onClick={() => {
              clipboard.copy(address);
              showSuccess('Copied!')
            }}
          >
            <IconCopy size="17px" color={theme.colors.text[0]} />
          </Flex>
        </Flex>
        <Flex>
          <Text color="text.0" mr="5px">
            Balance:
          </Text>
          <Text color="text.0" weight="700">
            {balance} CKB
          </Text>
          {content && balance - onChainSize > 0 && (
            <Text color="text.1" ml="5px">
              (will be ~{balance - onChainSize} CKB after minting)
            </Text>
          )}
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
        data={clusters.map(({ id, name }) => ({
          value: id,
          label: name,
        }))}
        value={clusterId}
        onChange={(id) => setClusterId(id || undefined)}
        dropdownComponent={DropdownContainerRef}
        disabled={loading}
        searchable
      />

      {content ? (
        <ImagePreviewRender
          content={content}
          onClick={() => dropzoneOpenRef.current?.()}
        />
      ) : (
        <Dropzone
          openRef={dropzoneOpenRef}
          onDrop={handleDrop}
          classNames={{ root: classes.dropzone }}
          accept={SUPPORTED_MIME_TYPE}
          onReject={() => {
            showError(
              `Only image files are supported, and the size cannot exceed ${MAX_SIZE_LIMIT}KB.`,
            );
          }}
          maxSize={MAX_SIZE_LIMIT * 1000}
        >
          <Flex direction="column" align="center">
            <Flex align="center" mb="16px">
              <Text size="xl">Drag or</Text>
              <Text
                size="xl"
                color="brand.1"
                sx={{ textDecoration: 'underline' }}
                mx="5px"
                inline
              >
                upload
              </Text>
              <Text size="xl">an image here</Text>
            </Flex>
            <Text size="sm" color="text.1">
              The file cannot exceed {MAX_SIZE_LIMIT} KB
            </Text>
          </Flex>
        </Dropzone>
      )}
      {content && (
        <Flex direction="column" my="md">
          <Flex>
            <Text color="text.0">Estimated On-chain Size</Text>
          </Flex>
          <Flex align="center">
            <Text weight="bold" color="text.0" mr="5px">
              ≈ {onChainSize} CKB
            </Text>
            <Popover
              width={356}
              classNames={{ dropdown: classes.popover, arrow: classes.arrow }}
              arrowOffset={15}
              position="top-start"
              opened={opened}
              withArrow
            >
              <Popover.Target>
                <Image
                  src="/svg/icon-info.svg"
                  alt="info"
                  width="20"
                  height="20"
                  sx={{ cursor: 'pointer' }}
                  onMouseEnter={open}
                  onMouseLeave={close}
                />
              </Popover.Target>
              <Popover.Dropdown sx={{ pointerEvents: 'none' }}>
                <Text color="white" size="sm">
                  By creating a spore, you are reserving this amount of CKB for
                  on-chain storage. You can always destroy spores to redeem your
                  reserved CKB.
                </Text>
              </Popover.Dropdown>
            </Popover>
          </Flex>
        </Flex>
      )}
      {error && (
        <Text size="sm" color="functional.0">
          {getFriendlyErrorMessage(error.message)}
        </Text>
      )}
      <Group position="right" mt="32px">
        <Button
          className={classes.submit}
          disabled={!content}
          onClick={handleSubmit}
          loading={loading}
        >
          Mint
        </Button>
      </Group>
    </Box>
  );
}
