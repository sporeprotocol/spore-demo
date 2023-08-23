import useCreateClusterModal from '@/hooks/modal/useCreateClusterModal';
import useMintSporeModal from '@/hooks/modal/useMintSporeModal';
import { Button, Menu, Text, createStyles } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

const useStyles = createStyles((theme) => ({
  create: {
    backgroundColor: theme.colors.brand[1],

    '&:hover': {
      backgroundColor: '#7F6BD1',
    },
  },
  dropdown: {
    padding: 0,
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: theme.colors.text[0],
    borderRadius: '8px',
    boxShadow: `4px 4px 0 ${theme.colors.text[0]}`,
  },
  arrow: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: theme.colors.text[0],
  },
  item: {
    position: 'relative',
    zIndex: 10,
    borderRadius: 0,

    '&:first-of-type': {
      borderTopRightRadius: '8px',
      borderTopLeftRadius: '8px',
    },

    '&:last-of-type': {
      borderBottomRightRadius: '8px',
      borderBottomLeftRadius: '8px',
    },

    '&:hover': {
      backgroundColor: theme.colors.background[0],
    }
  },
}));

export default function CreateButton() {
  const { classes } = useStyles();
  const createClusterModal = useCreateClusterModal();
  const mintSporeModal = useMintSporeModal();

  return (
    <Menu
      width={180}
      position="bottom"
      trigger="hover"
      classNames={{
        dropdown: classes.dropdown,
        arrow: classes.arrow,
        item: classes.item,
      }}
      arrowSize={10}
      arrowPosition="center"
      withArrow
    >
      <Menu.Target>
        <Button className={classes.create}>
          <IconPlus />
          <Text>Create</Text>
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={mintSporeModal.open}>Mint a Spore</Menu.Item>
        <Menu.Item onClick={createClusterModal.open}>Create a Cluster</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
