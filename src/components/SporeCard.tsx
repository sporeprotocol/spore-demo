import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
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
} from '@mantine/core';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export interface SporeCardProps {
  cluster: Cluster | undefined;
  spore: Spore;
}

const useStyles = createStyles((theme) => ({
  card: {
    borderRadius: '8px',
    borderWidth: '1px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: `4px 4px 0px 0px ${theme.colors.text[0]}`,
    backgroundImage: 'url(/images/noise-on-purple.png)',
  },
  skeleton: {
    height: '100%',
    width: '100%',
  },
}));

export function SporeSkeletonCard() {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Card p={0} className={classes.card}>
      <Card.Section px="md">
        <AspectRatio ratio={1} bg="#F4F5F9">
          <Skeleton
            className={classes.skeleton}
            baseColor={theme.colors.background[1]}
          />
        </AspectRatio>
      </Card.Section>
      <Box p="24px">
        <Flex direction="column">
          <Text color="rgba(255, 255, 255, 0.8)" size="sm" mb="8px">
            <Skeleton
              baseColor={theme.colors.background[1]}
              height="25px"
              borderRadius="16px"
            />
          </Text>
          <Text size="lg" color="white" weight="bold" mb="8px">
            <Skeleton
              baseColor={theme.colors.background[1]}
              height="25px"
              borderRadius="16px"
            />
          </Text>
          <Text size="md" color="white">
            <Skeleton
              baseColor={theme.colors.background[1]}
              height="25px"
              borderRadius="16px"
            />
          </Text>
        </Flex>
      </Box>
    </Card>
  );
}

export default function SporeCard({ cluster, spore }: SporeCardProps) {
  const { classes } = useStyles();

  return (
    <Link
      href={`/spore/${spore.id}`}
      style={{ textDecoration: 'none' }}
      passHref
    >
      <Card p={0} className={classes.card}>
        <Card.Section px="md">
          <AspectRatio ratio={1} bg="#F4F5F9">
            <Image alt={spore.id} src={`/api/v1/media/${spore.id}`} />
          </AspectRatio>
        </Card.Section>
        <Box p="24px">
          <Flex direction="column">
            <Text color="rgba(255, 255, 255, 0.8)" size="sm" mb="8px">
              {cluster?.name ?? '<No Cluster>'}
            </Text>
            <Text size="lg" color="white" weight="bold" mb="8px">
              {`${spore.id.slice(0, 10)}...${spore.id.slice(-10)}`}
            </Text>
            <Text size="md" color="white">
              {BI.from(spore.cell.cellOutput.capacity).toNumber() / 10 ** 8} CKB
            </Text>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}
