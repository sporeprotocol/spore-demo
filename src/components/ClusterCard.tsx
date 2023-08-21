import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import {
  Text,
  Image,
  Card,
  AspectRatio,
  SimpleGrid,
  Flex,
  createStyles,
  Box,
  useMantineTheme,
} from '@mantine/core';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export interface ClusterCardProps {
  cluster: Cluster;
  spores: Spore[];
}

const useStyles = createStyles((theme) => ({
  card: {
    position: 'relative',
    borderRadius: '8px',
    borderWidth: '1px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: `4px 4px 0px 0px ${theme.colors.text[0]}`,
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },
  section: {
    borderBottomWidth: '1px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
  },
  skeleton: {
    height: '100%',
    width: '100%',
  },
}));

export function ClusterSkeletonCard() {
  const { classes } = useStyles();
  const theme = useMantineTheme();

  return (
    <Card p={0} className={classes.card}>
      <Card.Section px="md" pt="md">
        <AspectRatio ratio={140 / 80}>
          <Skeleton
            className={classes.skeleton}
            baseColor={theme.colors.background[1]}
          />
        </AspectRatio>
      </Card.Section>

      <Box p="24px">
        <Text mb="8px">
          <Skeleton
            baseColor={theme.colors.background[1]}
            height="25px"
            borderRadius="16px"
          />
        </Text>
        <Text mb="8px" size="sm">
          <Skeleton
            baseColor={theme.colors.background[1]}
            height="20px"
            borderRadius="16px"
          />
        </Text>
        <Text color="text.0">
          <Skeleton
            baseColor={theme.colors.background[1]}
            height="26px"
            width="85px"
            borderRadius="16px"
          />
        </Text>
      </Box>
    </Card>
  );
}

export default function ClusterCard({ cluster, spores }: ClusterCardProps) {
  const { classes } = useStyles();
  const cols = spores.length >= 4 ? 2 : 1;

  return (
    <Card p={0} className={classes.card}>
      <Link
        href={`/cluster/${cluster.id}`}
        style={{ textDecoration: 'none' }}
        passHref
      >
        <Card.Section px="md" className={classes.section}>
          {spores.length > 0 ? (
            <SimpleGrid cols={cols} spacing="1px" bg="text.0">
              {spores.slice(0, cols * cols).map((spore) => {
                return (
                  <AspectRatio key={spore.id} ratio={140 / 80} bg="#F4F5F9">
                    <Image src={`/api/v1/media/${spore.id}`} alt={spore.id} />
                  </AspectRatio>
                );
              })}
            </SimpleGrid>
          ) : (
            <AspectRatio ratio={140 / 80}>
              <Flex justify="center" align="center" bg="background.1">
                <Text color="text.0" size="xl">
                  No Spores
                </Text>
              </Flex>
            </AspectRatio>
          )}
        </Card.Section>

        <Box p="24px">
          <Flex align="center" mb="8px">
            <Image
              src="/cluster-icon.svg"
              alt="Cluster Icon"
              width="24px"
              height="24px"
              mr="8px"
            />
            <Text
              component="span"
              sx={{
                textOverflow: 'ellipsis',
                maxWidth: 'calc(100% - 32px)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              size="lg"
              color="text.0"
              weight="bold"
            >
              {cluster.name}
            </Text>
          </Flex>
          <Text mb="8px" size="sm" color="text.1">
            {cluster.description}
          </Text>
          <Text color="text.0">{spores.length} Spores</Text>
        </Box>
      </Link>
    </Card>
  );
}
