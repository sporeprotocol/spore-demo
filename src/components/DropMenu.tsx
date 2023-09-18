import { Menu, createStyles, useMantineTheme } from '@mantine/core';
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
  divider: {
    marginTop: '0px',
    marginBottom: '0px',
    borderTopColor: theme.colors.text[0],
    borderTopWidth: '2px'
  },
}));

export interface DropMenuProps extends React.PropsWithChildren<{}> {
  menu: (
    | {
        key: string;
        type: 'item';
        title: React.ReactNode | string;
        onClick?: MouseEventHandler<HTMLButtonElement>;
      }
    | { type: 'divider' }
  )[];
  position?: FloatingPosition;
  width?: number;
}

export default function DropMenu(props: DropMenuProps) {
  const { classes } = useStyles();
  const { menu, position, children, width = 180 } = props;

  return (
    <Menu
      width={width}
      position={position ?? 'bottom'}
      trigger="hover"
      classNames={{
        dropdown: classes.dropdown,
        arrow: classes.arrow,
        item: classes.item,
      }}
      arrowSize={10}
      arrowPosition="center"
    >
      <Menu.Target>{children}</Menu.Target>

      <Menu.Dropdown>
        {menu.map((item, index) => {
          if (item.type === 'divider')
            return (
              <Menu.Divider
                className={classes.divider}
                key={`divider_${index}`}
              />
            );
          if (item.type === 'item') {
            const { key, title, onClick } = item;
            return (
              <Menu.Item key={key} onClick={onClick}>
                {title}
              </Menu.Item>
            );
          }
          return null;
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
