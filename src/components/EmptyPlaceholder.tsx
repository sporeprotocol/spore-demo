import {
  Text,
  Box,
  Button,
  Flex,
  Title,
  createStyles,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';

const useStyles = createStyles((theme) => ({
  button: {
    backgroundColor: 'transparent',
    color: theme.colors.brand[1],
    border: `2px solid ${theme.colors.brand[1]}`,
    boxShadow: 'none !important',

    '&:hover': {
      color: theme.white,
      backgroundColor: theme.colors.brand[1],
    },
  },
}));

export interface EmptyPlaceholderProps {
  title: string;
  description: string;
  submitLabel: string;
  onClick: () => void;
}

export default function EmptyPlaceholder(props: EmptyPlaceholderProps) {
  const { classes } = useStyles();
  const { title, description, submitLabel, onClick } = props;
  const them = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${them.breakpoints.sm})`);

  return (
    <Flex direction="column" align="center">
      <Box mt="52px" mb="32px">
        <Image
          src="/svg/empty-illus.svg"
          alt="empty-illus"
          width="272"
          height="272"
        />
      </Box>
      <Title order={3} mb="md">
        {title}
      </Title>
      <Text color="text.1" mb="32px" align={isMobile ? 'center' : 'left'}>
        {description}
      </Text>
      <Button
        classNames={{ root: classes.button }}
        onClick={onClick}
        fullWidth={isMobile}
      >
        {submitLabel}
      </Button>
    </Flex>
  );
}
