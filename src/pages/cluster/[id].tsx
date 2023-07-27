import Layout from '@/components/Layout';
import {
  Title,
  Text,
  Flex,
  Group,
  Button,
  Modal,
  Box,
  Image,
  SimpleGrid,
} from '@mantine/core';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { GetServerSideProps } from 'next';
import { Spore, createSpore, getSpores } from '@/spore';
import { Cluster, getCluster } from '@/cluster';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import useConnect from '@/hooks/useConnect';

export const getServerSideProps: GetServerSideProps = async (context) => {
  context.res.setHeader(
    'Cache-Control',
    'public, s-maxage=10, stale-while-revalidate=59',
  );

  const { id } = context.query;
  const cluster = await getCluster(id as string);
  const spores = await getSpores(id as string);
  return {
    props: { cluster, spores },
  };
};

export type ClusterPageProps = {
  cluster: Cluster;
  spores: Spore[];
};

export default function ClusterPage(props: ClusterPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = router.query;
  const { address, lock, isConnected } = useConnect();
  const [opened, { open, close }] = useDisclosure(false);
  const [content, setContent] = useState<Blob | null>(null);

  const { data: cluster } = useQuery(
    ['cluster', id],
    () => getCluster(id as string),
    { initialData: props.cluster },
  );
  const { data: spores = [] } = useQuery(
    ['spores', id],
    () => getSpores(id as string),
    { initialData: props.spores },
  );

  const createMutation = useMutation(createSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries(['spores', id]);
    },
  });

  const imageUrl = useMemo(() => {
    if (!content) {
      return '';
    }
    return URL.createObjectURL(content);
  }, [content]);

  useEffect(() => {
    if (opened) {
      setContent(null);
    }
  }, [opened]);

  const handleDrop: DropzoneProps['onDrop'] = useCallback((files) => {
    const [file] = files;
    setContent(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content || !address || !lock) {
      return;
    }

    const contentBuffer = await content.arrayBuffer();
    const txHash = await createMutation.mutateAsync({
      sporeData: {
        contentType: content.type,
        content: new Uint8Array(contentBuffer),
        clusterId: cluster?.id,
      },
      fromInfos: [address],
      toLock: lock,
      config: predefinedSporeConfigs.Aggron4,
    });
    console.log(txHash);
    close();
  }, [content, createMutation, cluster, address, lock, close]);

  if (!cluster) {
    return null;
  }

  return (
    <Layout>
      <Modal opened={opened} onClose={close} title="Create Spore">
        {content ? (
          <Image
            src={imageUrl}
            alt="preview"
            imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
          />
        ) : (
          <Dropzone onDrop={handleDrop} accept={IMAGE_MIME_TYPE}>
            <Group position="center" spacing="xl">
              <Dropzone.Accept>
                <IconUpload size="3.2rem" stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Idle>
                <IconPhoto size="3.2rem" stroke={1.5} />
              </Dropzone.Idle>
              <div>
                <Text size="lg" inline>
                  Drag images here or click to select files
                </Text>
              </div>
            </Group>
          </Dropzone>
        )}
        <Group position="right" mt="md">
          <Button disabled={!content} onClick={handleSubmit}>
            Submit
          </Button>
        </Group>
      </Modal>

      <Flex direction="row" justify="space-between" align="end">
        <Flex direction="column">
          <Title order={1}>{cluster?.name}</Title>
          <Text>{cluster?.description}</Text>
        </Flex>
        <Box style={{ cursor: isConnected ? 'pointer' : 'not-allowed' }}>
          <Button disabled={!isConnected} onClick={open}>
            Create
          </Button>
        </Box>
      </Flex>

      <Box mt={20}>
        <SimpleGrid cols={4}>
          {spores.map((spore) => {
            const url = URL.createObjectURL(spore.content);

            return (
              <Image
                key={spore.id}
                alt={spore.id}
                src={url}
                imageProps={{ onLoad: () => URL.revokeObjectURL(url) }}
              />
            );
          })}
        </SimpleGrid>
      </Box>
    </Layout>
  );
}
