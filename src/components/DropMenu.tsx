import { Menu, createStyles } from '@mantine/core';
import { FloatingPosition } from '@mantine/core/lib/Floating';
import { MouseEventHandler } from 'react';

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
    },
  },
}));

export interface DropMenuProps extends React.PropsWithChildren<{}> {
  menu: {
    key: string;
    title: React.ReactNode | string;
    onClick: MouseEventHandler<HTMLButtonElement>;
  }[];
  position?: FloatingPosition;
}

export default function DropMenu(props: DropMenuProps) {
  const { classes } = useStyles();
  const { menu, position, children } = props;

  return (
    <Menu
      width={180}
      position={position ?? "bottom"}
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
        {children}
      </Menu.Target>

      <Menu.Dropdown>
        {menu.map(({ key, title, onClick }) => {
          return (
            <Menu.Item key={key} onClick={onClick}>
              {title}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
