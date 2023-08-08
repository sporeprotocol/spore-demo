import useAddClusterModal from '@/hooks/modal/useAddClusterModal';
import useAddSporeModal from '@/hooks/modal/useAddSporeModal';
import { Button, Menu } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function CreateButton() {
  const addClusterModal = useAddClusterModal();
  const addSporeModal = useAddSporeModal();

  return (
    <Menu position="bottom-end" trigger="hover" shadow="sm" width={200}>
      <Menu.Target>
        <Button variant="filled">
          <IconPlus />
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={addClusterModal.open}>Add Cluster</Menu.Item>
        <Menu.Item onClick={addSporeModal.open}>Add Spore</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
