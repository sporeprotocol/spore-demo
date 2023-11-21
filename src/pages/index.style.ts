import { createStyles } from '@mantine/core';

export const useStyles = createStyles((theme) => ({
  banner: {
    minHeight: '280px',
    overflowY: 'hidden',
    borderBottomWidth: '2px',
    borderBottomColor: theme.colors.text[0],
    borderBottomStyle: 'solid',
    backgroundImage: 'url(/images/noise-on-yellow.png)',

    [theme.fn.smallerThan('sm')]: {
      minHeight: '232px',
    },
  },
  container: {
    position: 'relative',
  },
  illus: {
    position: 'absolute',
    left: '-387px',
    top: '-25px',
  },
  type: {
    height: '32px',
    border: '1px solid #CDCFD5',
    backgroundColor: '#FFF',
    borderRadius: '20px',
    paddingLeft: '16px',
    paddingRight: '16px',
    cursor: 'pointer',

    '&:hover': {
      backgroundColor: 'rgba(26, 32, 44, 0.08)',
    },
  },
  active: {
    backgroundColor: theme.colors.brand[1],
    color: '#FFF',
  },
  more: {
    color: theme.colors.brand[1],
    backgroundColor: 'transparent',
    borderWidth: '2px',
    borderColor: theme.colors.brand[1],
    borderStyle: 'solid',
    boxShadow: 'none !important',

    '&:hover': {
      backgroundColor: theme.colors.brand[1],
      color: theme.white,
    },
  },
}));
