import useConnect from '@/hooks/useConnect';
import { createSpore } from '@/spore';
import { Text, Modal, Image, Group, Button } from '@mantine/core';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { predefinedSporeConfigs } from '@spore-sdk/core';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';

export interface SporeAddModalProps {
  clusterId?: string;
  children: ({
    open,
    isLoading,
  }: {
    open: () => void;
    isLoading: boolean;
  }) => JSX.Element;
}

export default function SporeAddModal(props: SporeAddModalProps) {
  const { clusterId } = props;
  const queryClient = useQueryClient();
  const { address, lock } = useConnect();
  const [opened, { open, close }] = useDisclosure(false);
  const [content, setContent] = useState<Blob | null>(null);

  const createMutation = useMutation(createSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries(['spores', clusterId]);
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

    try {
      const contentBuffer = await content.arrayBuffer();
      await createMutation.mutateAsync({
        sporeData: {
          contentType: content.type,
          content: new Uint8Array(contentBuffer),
          clusterId,
        },
        fromInfos: [address],
        toLock: lock,
        config: predefinedSporeConfigs.Aggron4,
      });
      notifications.show({
        color: 'green',
        title: 'Congratulations!',
        message: 'Your spore has been successfully minted.',
      });
      close();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Error!',
        message: (e as Error).message,
      });
    }
  }, [content, createMutation, clusterId, address, lock, close]);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add Spore">
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
          <Button
            disabled={!content}
            onClick={handleSubmit}
            loading={createMutation.isLoading}
          >
            Mint
          </Button>
        </Group>
      </Modal>
      {props.children({ open, isLoading: createMutation.isLoading })}
    </>
  );
}
