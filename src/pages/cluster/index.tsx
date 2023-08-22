import Layout from '@/components/Layout';
import { trpc } from '@/server';
import Image from 'next/image';
import {
  Text,
  Box,
  Container,
  Flex,
  createStyles,
  MediaQuery,
} from '@mantine/core';
import ClusterGrid from '@/components/ClusterGrid';

const useStyles = createStyles((theme) => ({
  banner: {
    height: '280px',
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',
  },

  container: {
    position: 'relative',
  },

  illus: {
    position: 'absolute',
    right: '-330px',
    top: '-48px',
  },
}));

export default function ClustersPage() {
  const { classes } = useStyles();

  const { data: clusters = [], isLoading: isClusterLoading } =
    trpc.cluster.list.useQuery();
  const { data: spores = [], isLoading: isSporesLoading } =
    trpc.spore.list.useQuery();

  const isLoading = isClusterLoading || isSporesLoading;

  return (
    <Layout>
      <Flex align="center" className={classes.banner}>
        <Container size="xl" mt="80px" className={classes.container}>
          <MediaQuery query="(max-width: 80rem)" styles={{ display: 'none' }}>
            <Image
              className={classes.illus}
              src="/svg/all-clusters-illus.svg"
              width="358"
              height="358"
              alt="Spore Demo Illus"
            />
          </MediaQuery>
          <Flex direction="column" justify="center" align="center" gap="32px">
            <Image
              src="/images/clusters-title.png"
              width="766"
              height="60"
              layout="responsive"
              alt="Spore Demo"
            />

            <Text size="xl" align="center">
              Transform your imaginative visions into vibrant Clusters!
            </Text>
          </Flex>
        </Container>
      </Flex>
      <Container py="48px" size="xl">
        <Box mb="60px">
          <ClusterGrid
            title="Explore All Clusters"
            clusters={clusters}
            spores={spores}
            isLoading={isLoading}
          />
        </Box>
      </Container>
    </Layout>
  );
}
