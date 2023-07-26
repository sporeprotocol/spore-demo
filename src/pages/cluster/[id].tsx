import Layout from '@/components/Layout';
import useClusterCollector from '@/hooks/useClusterCollector';
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
import { createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import useCkbAddress from '@/hooks/useCkbAddress';
import useSendTransaction from '@/hooks/useSendTransaction';
import useSporeCollector from '@/hooks/useSporeCollector';

export default function ClusterPage() {
  const router = useRouter();
  const { id } = router.query;
  const { address, lock } = useCkbAddress();
  const [opened, { open, close }] = useDisclosure(false);
  const [content, setContent] = useState<Blob | null>(null);
  const { sendTransaction } = useSendTransaction();

  const { clusters } = useClusterCollector();
  const cluster = useMemo(
    () => clusters.find((c) => c.id === id),
    [clusters, id],
  );
  const { spores } = useSporeCollector(cluster?.id);

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
    if (!content || !address) {
      return;
    }

    const contentBuffer = await content.arrayBuffer();

    const { txSkeleton } = await createSpore({
      sporeData: {
        contentType: content.type,
        content: new Uint8Array(contentBuffer),
        clusterId: cluster?.cell.cellOutput.type?.args,
      },
      fromInfos: [address],
      toLock: lock,
      config: predefinedSporeConfigs.Aggron4,
    });
    console.log({
      sporeData: {
        contentType: content.type,
        content: new Uint8Array(contentBuffer),
        clusterId: cluster?.cell.cellOutput.type?.args,
      },
      fromInfos: [address],
      toLock: lock,
      config: predefinedSporeConfigs.Aggron4,
    });
    const txHash = await sendTransaction(txSkeleton);
    console.log(txHash);
    close();
  }, [content, cluster, address, lock, sendTransaction, close]);

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
        <Box>
          <Button onClick={open}>Create</Button>
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
