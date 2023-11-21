import { createStyles } from '@mantine/core';

export const useStyles = createStyles((theme) => ({
  header: {
    height: '280px',
    overflow: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',

    [theme.fn.largerThan('sm')]: {
      paddingLeft: '40px',
      paddingRight: '40px',
    },

    [theme.fn.smallerThan('sm')]: {
      minHeight: '452px',
    },
  },
  name: {
    textOverflow: 'ellipsis',
    maxWidth: '574px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',

    [theme.fn.smallerThan('sm')]: {
      maxWidth: '99vw',
    },
  },
  description: {
    textOverflow: 'ellipsis',
    maxWidth: '953px ',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  button: {
    color: theme.colors.text[0],
    backgroundColor: theme.colors.brand[0],
    borderWidth: '2px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: 'none !important',

    [theme.fn.smallerThan('sm')]: {
      flexGrow: 1,
    },

    '&:hover': {
      backgroundColor: theme.colors.text[0],
      color: theme.white,
    },
  },
  more: {
    color: theme.colors.text[0],
    backgroundColor: theme.colors.brand[0],
    borderWidth: '2px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    boxShadow: 'none !important',
    minWidth: '48px !important',
    width: '48px',
    padding: '0px !important',

    '&:hover': {
      backgroundColor: theme.colors.text[0],
      color: theme.white,
      fill: theme.white,
    },
  },
}));
