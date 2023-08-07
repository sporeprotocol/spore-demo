import { createSpore, predefinedSporeConfigs } from '@spore-sdk/core';
import useWalletConnect from './useWalletConnect';
import { RPC, config, helpers } from '@ckb-lumos/lumos';
import { waitForTranscation } from '@/transaction';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'wagmi';
import { useQueryClient } from 'react-query';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { Button, Group, Text, Image, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import useClustersQuery from './useClustersQuery';

export default function useAddSporeModal(id?: string) {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock, signTransaction } = useWalletConnect();
  const queryClient = useQueryClient();
  const [content, setContent] = useState<Blob | null>(null);
  const [clusterId, setClusterId] = useState<string | undefined>(id);
  const [dataUrl, setDataUrl] = useState<string | ArrayBuffer | null>(null);
  const modalId = useId();

  useEffect(() => {
    console.log(opened);
  }, [opened]);

  const clustersQuery = useClustersQuery();
  const selectableQuerys = useMemo(() => {
    if (!clustersQuery.data) {
      return [];
    }
    return clustersQuery.data.filter(({ cell }) => {
      const anyoneCanPayScript =
        config.predefined.AGGRON4.SCRIPTS['ANYONE_CAN_PAY'];
      return (
        cell.cellOutput.lock.codeHash === anyoneCanPayScript.CODE_HASH ||
        helpers.encodeToAddress(cell.cellOutput.lock) === address
      );
    });
  }, [clustersQuery, address]);

  const addSpore = useCallback(
    async (...args: Parameters<typeof createSpore>) => {
      const rpc = new RPC(predefinedSporeConfigs.Aggron4.ckbNodeUrl);
      const { txSkeleton } = await createSpore(...args);
      const signedTx = await signTransaction(txSkeleton);
      console.log(signedTx);
      const hash = await rpc.sendTransaction(signedTx, 'passthrough');
      await waitForTranscation(hash);
      return hash;
    },
    [signTransaction],
  );

  const addSporeMutation = useMutation(addSpore, {
    onSuccess: () => {
      queryClient.invalidateQueries('spores');
      queryClient.invalidateQueries(['account', address]);
    },
  });
  const loading = addSporeMutation.isLoading;

  const handleDrop: DropzoneProps['onDrop'] = useCallback((files) => {
    const [file] = files;
    setContent(file);
    const reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setDataUrl(reader.result);
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content || !address || !lock) {
      return;
    }

    try {
      const contentBuffer = await content.arrayBuffer();
      await addSporeMutation.mutateAsync({
        data: {
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
  }, [content, address, lock, addSporeMutation, close, clusterId]);

  useEffect(() => {
    if (opened) {
      modals.open({
        modalId,
        title: 'Add New spore',
        onClose: () => {
          setClusterId(id);
          setContent(null);
          setDataUrl(null);
          close();
        },
        closeOnEscape: !addSporeMutation.isLoading,
        withCloseButton: !addSporeMutation.isLoading,
        closeOnClickOutside: !addSporeMutation.isLoading,
        children: (
          <>
            <Select
              mb="md"
              dropdownPosition="bottom"
              maxDropdownHeight={400}
              placeholder="Choose Cluster"
              data={selectableQuerys.map(({ id, name }) => ({
                value: id,
                label: name,
              }))}
              value={clusterId}
              onChange={(id) => setClusterId(id || undefined)}
            />

            {dataUrl ? (
              <Image src={dataUrl.toString()} alt="preview" />
            ) : (
              <Dropzone
                onDrop={handleDrop}
                accept={IMAGE_MIME_TYPE}
                onReject={() => {
                  notifications.show({
                    color: 'red',
                    title: 'Error!',
                    message:
                      'Only image files are supported, and the size cannot exceed 300KB.',
                  });
                }}
                maxSize={300_000}
              >
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
                Submit
              </Button>
            </Group>
          </>
        ),
      });
    } else {
      modals.close(modalId);
    }
  }, [
    modalId,
    addSporeMutation.isLoading,
    selectableQuerys,
    content,
    handleDrop,
    handleSubmit,
    dataUrl,
    opened,
    close,
    clusterId,
    id,
  ]);

  return {
    open,
    close,
    loading,
  };
}
