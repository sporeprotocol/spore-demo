import { getFriendlyErrorMessage } from '@/utils/error';
import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  Box,
  Button,
  Flex,
  Group,
  createStyles,
  useMantineTheme,
  Stack,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import { Spore } from 'spore-graphql';

export interface MeltSporeModalProps {
  spore: Spore | undefined;
  onSubmit: () => Promise<void>;
  onClose: () => void;
}

const useStyles = createStyles((theme) => ({
  cancel: {
    backgroundColor: 'transparent !important',
    border: 'none !important',
    boxShadow: 'none !important',
  },

  label: {
    color: `${theme.colors.brand[1]} !important`,
  },

  melt: {
    backgroundColor: theme.colors.functional[0],
    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.colors.functional[0], 0.1),
    },
  },
}));

export default function MeltSporeModal(props: MeltSporeModalProps) {
  const { spore, onSubmit, onClose } = props;
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const amount = Math.ceil(
    BI.from(spore?.cell?.cellOutput.capacity ?? 0).toNumber() / 10 ** 8,
  );

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit();
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [onSubmit]);

  return (
    <Box>
      <Text color="text.0" mb="32px">
        After melt this spore, you will be able to get ~{amount} CKB back in
        your wallet. This action cannot be undone.
      </Text>

      {error && (
        <Text size="sm" color="functional.0" mt="md">
          {getFriendlyErrorMessage(error.message)}
        </Text>
      )}

      <Flex direction="row" justify="flex-end">
        {!isMobile ? (
          <Group>
            <Button
              classNames={{ root: classes.cancel, label: classes.label }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className={classes.melt}
              onClick={handleSubmit}
              loading={loading}
            >
              Destory
            </Button>
          </Group>
        ) : (
          <Stack w="100%">
            <Button
              className={classes.melt}
              onClick={handleSubmit}
              loading={loading}
              fullWidth
            >
              Melt
            </Button>
            <Button
              classNames={{ root: classes.cancel, label: classes.label }}
              onClick={onClose}
              disabled={loading}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        )}
      </Flex>
    </Box>
  );
}
