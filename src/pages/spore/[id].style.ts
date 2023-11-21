import { createStyles } from '@mantine/core';

export const useStyles = createStyles((theme) => ({
  image: {
    width: '100%',
    height: '100%',
    maxWidth: '468px',
    maxWeight: '468px',
    borderRadius: '8px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '4px 4px 0 #111318',
    backgroundColor: theme.colors.background[1],
    overflow: 'hidden',

    [theme.fn.smallerThan('sm')]: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
  title: {
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    wordBreak: 'break-all',
  },
}));
