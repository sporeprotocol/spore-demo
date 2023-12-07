import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  AspectRatio,
  Card,
  Image,
  Flex,
  createStyles,
  Box,
  useMantineTheme,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconDotsVertical } from '@tabler/icons-react';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import DropMenu from './DropMenu';
import useTransferSporeModal from '@/hooks/modal/useTransferSporeModal';
import useMeltSporeModal from '@/hooks/modal/useMeltSporeModal';
import { useConnect } from '@/hooks/useConnect';
import { useMemo } from 'react';
import { isSameScript } from '@/utils/script';
import SporeCoverRender from './SporeCoverRender';
import useSponsorSporeModal from '@/hooks/modal/useSponsorSporeModal';
import { QuerySpore } from '@/hooks/query/type';
import { useSporeQuery } from '@/hooks/query/useSporeQuery';
import { useRouter } from 'next/router';

export interface SporeCardProps {
  spore: QuerySpore;
}

const useStyles = createStyles((theme) => ({
  card: {
    borderRadius: '8px',
    borderWidth: '1px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: `4px 4px 0px 0px ${theme.colors.text[0]}`,
    backgroundImage: 'url(/images/noise-on-purple.png)',
    transition: 'border-radius 150ms ease',

    '&:hover': {
      borderRadius: '16px',
    },
  },
  title: {
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  skeleton: {
    height: '100%',
    width: '100%',
  },
  menu: {
    zIndex: 99,
    display: 'inline',
    position: 'absolute',
    bottom: '25px',
    right: '15px',
  },
}));

export function SporeSkeletonCard() {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Card p={0} className={classes.card}>
      <Card.Section px="md" pt="md">
        <AspectRatio ratio={1} bg="#F4F5F9">
          <Skeleton className={classes.skeleton} baseColor={theme.colors.background[1]} />
        </AspectRatio>
      </Card.Section>
      <Box p="24px">
        <Flex direction="column">
          <Text color="rgba(255, 255, 255, 0.8)" size="sm" mb="8px">
            <Skeleton baseColor={theme.colors.background[1]} height="25px" borderRadius="16px" />
          </Text>
          <Text size="lg" color="white" weight="bold" mb="8px">
            <Skeleton baseColor={theme.colors.background[1]} height="25px" borderRadius="16px" />
          </Text>
          <Text size="md" color="white">
            <Skeleton
              baseColor={theme.colors.background[1]}
              height="25px"
              width="85px"
              borderRadius="16px"
            />
          </Text>
        </Flex>
      </Box>
    </Card>
  );
}

export default function SporeCard(props: SporeCardProps) {
  const { spore: sourceSpore } = props;
  const { classes } = useStyles();
  const [hovered, { close, open }] = useDisclosure(false);
  const router = useRouter();
  const { address, lock } = useConnect();
  const { data: spore = sourceSpore } = useSporeQuery(sourceSpore?.id, false);

  const showActions = useMemo(() => {
    if (!spore || !lock) {
      return false;
    }
    if (
      router.pathname.startsWith('/cluster') ||
      router.pathname === '/my' ||
      (router.pathname === '/[address]' && router.query.address === address)
    ) {
      return isSameScript(spore.cell?.cellOutput.lock, lock);
    }
    return false;
  }, [spore, lock, router.pathname, router.query.address, address]);

  const transferSporeModal = useTransferSporeModal(spore);
  const meltSporeModal = useMeltSporeModal(spore);
  const sponsorSporeModal = useSponsorSporeModal(spore);

  const amount = BI.from(spore.cell?.cellOutput.capacity ?? 0).toNumber() / 10 ** 8;

  if (!spore) {
    return <SporeSkeletonCard />;
  }

  return (
    <Box
      sx={{ overflow: 'visible', position: 'relative' }}
      onMouseEnter={() => open()}
      onMouseLeave={() => close()}
    >
      <Link href={`/spore/${spore.id}`} style={{ textDecoration: 'none' }} passHref>
        <Card p={0} className={classes.card}>
          <Card.Section px="md" pt="md">
            <SporeCoverRender spore={spore} />
          </Card.Section>
          <Box p="24px">
            <Flex direction="column">
              <Text color="rgba(255, 255, 255, 0.8)" className={classes.title} size="sm" mb="8px">
                {spore.cluster?.name ?? '<No Cluster>'}
              </Text>
              <Title color="white" order={5} mb="8px">
                {`${spore.id.slice(0, 10)}...${spore.id.slice(-10)}`}
              </Title>
              <Flex>
                <Text size="md" color="white">
                  {amount.toLocaleString('en-US')} CKByte
                </Text>
              </Flex>
            </Flex>
          </Box>
        </Card>
      </Link>
      {hovered && showActions && (
        <Box className={classes.menu}>
          <Flex align="center" justify="flex-end">
            <DropMenu
              menu={[
                {
                  type: 'item',
                  key: 'transfer-spore',
                  title: (
                    <Flex align="center">
                      <Image
                        src="/svg/icon-repeat.svg"
                        width="18"
                        height="18"
                        alt="transfer"
                        mr="8px"
                      />
                      <Text>Transfer</Text>
                    </Flex>
                  ),
                  onClick: (e) => {
                    e.preventDefault();
                    transferSporeModal.open();
                  },
                },
                {
                  type: 'item',
                  key: 'sponsor-spore',
                  title: (
                    <Flex align="center">
                      <Image
                        src="/svg/icon-add-capacity.svg"
                        fit="contain"
                        width="18"
                        height="18"
                        alt="transfer"
                        mr="8px"
                      />
                      <Text>Sponsor</Text>
                    </Flex>
                  ),
                  onClick: (e) => {
                    e.preventDefault();
                    sponsorSporeModal.open();
                  },
                },
                {
                  type: 'item',
                  key: 'melt-spore',
                  title: (
                    <Flex align="center">
                      <Image
                        src="/svg/icon-trash.svg"
                        width="18"
                        height="18"
                        alt="transfer"
                        mr="8px"
                      />
                      <Text>Melt</Text>
                    </Flex>
                  ),
                  onClick: (e) => {
                    e.preventDefault();
                    meltSporeModal.open();
                  },
                },
              ]}
            >
              <Flex align="center" sx={{ cursor: 'pointer' }}>
                <IconDotsVertical size="20px" color="white" />
              </Flex>
            </DropMenu>
          </Flex>
        </Box>
      )}
    </Box>
  );
}
