import { predefinedSporeConfigs } from '@spore-sdk/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDisclosure, useId } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { Button, Group, Text, Image, Select } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { IconPhoto, IconUpload } from '@tabler/icons-react';
import { isAnyoneCanPay, isSameScript } from '@/utils/script';
import useAddSporeMutation from '../mutation/useAddSporeMutation';
import { useConnect } from '../useConnect';
import { trpc } from '@/server';

export default function useAddSporeModal(id?: string) {
  const [opened, { open, close }] = useDisclosure(false);
  const { address, lock } = useConnect();
  const [content, setContent] = useState<Blob | null>(null);
  const [clusterId, setClusterId] = useState<string | undefined>(id);
  const [dataUrl, setDataUrl] = useState<string | ArrayBuffer | null>(null);
  const modalId = useId();

  const { data: clusters = [] } = trpc.cluster.list.useQuery();

  const selectableQuerys = useMemo(() => {
    return clusters.filter(({ cell }) => {
      return isSameScript(cell.cellOutput.lock, lock) || isAnyoneCanPay(cell.cellOutput.lock);
    });
  }, [clusters, lock]);

  const cluster = useMemo(
    () => selectableQuerys.find(({ id }) => id === clusterId),
    [selectableQuerys, clusterId],
  );
  const addSporeMutation = useAddSporeMutation(cluster);
  const loading = addSporeMutation.isLoading && !addSporeMutation.isError;

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
                maxSize={parseInt(process.env.NEXT_PUBLIC_MINT_SIZE_LIMIT ?? '300', 10) * 1000}
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
