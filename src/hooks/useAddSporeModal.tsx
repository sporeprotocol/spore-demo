import { createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import useWalletConnect from './useWalletConnect';
import { RPC } from '@ckb-lumos/lumos';
import { waitForTranscation } from '@/transaction';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'wagmi';
import { useQueryClient } from 'react-query';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { Button, Group, Text, Image } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload } from '@tabler/icons-react';

export default function useAddSporeModal(clusterId?: string) {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, signTransaction } = useWalletConnect();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<Blob | null>(null);

  const addSpore = useCallback(
    async (...args: Parameters<typeof createSpore>) => {
      const rpc = new RPC(predefinedSporeConfigs.Aggron4.ckbNodeUrl);
      const { txSkeleton } = await createSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      const hash = await rpc.sendTransaction(signedTx, 'passthrough');
      await waitForTranscation(hash);
      return hash;
    },
    [signTransaction],
  );

  const addSporeMutation = useMutation(addSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
    },
  });

  const loading = useMemo(
    () => addSporeMutation.isLoading,
    [addSporeMutation.isLoading],
  );

  const imageUrl = content ? URL.createObjectURL(content) : '';

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
      await addSporeMutation.mutateAsync({
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
  }, [content, address, lock, addSporeMutation, clusterId, close]);

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId: 'add-spore',
        title: 'Add New spore',
        children: (
          <>
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
                loading={addSporeMutation.isLoading}
              >
                Mint
              </Button>
            </Group>
          </>
        ),
      });
    } else {
      modals.close('add-spore');
    }
  }, [
    addSporeMutation.isLoading,
    content,
    handleDrop,
    handleSubmit,
    imageUrl,
    opened,
  ]);

  return {
    open,
    close,
    loading,
  };
}
