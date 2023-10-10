import {
  Text,
  Box,
  Popover as MantinePopover,
  createStyles,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

type PopoverProps = React.PropsWithChildren<{
  label: string;
}> &
  React.ComponentProps<typeof MantinePopover>;

const useStyles = createStyles((theme) => ({
  popover: {
    backgroundColor: theme.white,
    borderWidth: '1px',
    borderColor: theme.colors.text[0],
    boxShadow: '4px 4px 0 #111318',
  },
}));

export default function Popover({
  children,
  label,
  ...restProps
}: PopoverProps) {
  const { classes } = useStyles();
  const [opened, { close, open }] = useDisclosure(false);

  return (
    <MantinePopover
      width={356}
      classNames={{ dropdown: classes.popover }}
      arrowOffset={15}
      position="top-start"
      opened={opened}
      {...restProps}
    >
      <MantinePopover.Target>
        <Box
          sx={{ cursor: 'pointer' }}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          {children}
        </Box>
      </MantinePopover.Target>
      <MantinePopover.Dropdown sx={{ pointerEvents: 'none' }}>
        <Text color="text.0" size="14px">
          {label}
        </Text>
      </MantinePopover.Dropdown>
    </MantinePopover>
  );
}
