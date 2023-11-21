import { createStyles } from '@mantine/core';

export const useStyles = createStyles(
  (theme, params: { showMintableOnly: boolean }) => ({
    banner: {
      height: '280px',
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
      right: '-330px',
      top: '-48px',
    },
    track: {
      backgroundColor: 'transparent !important',
      borderWidth: '2px',
      borderColor:
        (params.showMintableOnly
          ? theme.colors.brand[1]
          : theme.colors.text[2]) + '!important',
      width: '40px',
      height: '24px',
      cursor: 'pointer',
    },
    thumb: {
      backgroundColor:
        (params.showMintableOnly
          ? theme.colors.brand[1]
          : theme.colors.text[2]) + '!important',
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
  }),
);
