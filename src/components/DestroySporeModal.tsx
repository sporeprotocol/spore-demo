import { Spore } from '@/spore';
import { getFriendlyErrorMessage } from '@/utils/error';
import { BI } from '@ckb-lumos/lumos';
import { Text, Box, Button, Flex, Group, createStyles } from '@mantine/core';
import { useCallback, useState } from 'react';

export interface DestroySporeModalProps {
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

  destory: {
    backgroundColor: theme.colors.functional[0],
    '&:hover': {
      backgroundColor: theme.fn.lighten(theme.colors.functional[0], 0.1),
    },
  },
}));

export default function DestroySporeModal(props: DestroySporeModalProps) {
  const { spore, onSubmit, onClose } = props;
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const amount = Math.ceil(
    BI.from(spore?.cell.cellOutput.capacity ?? 0).toNumber() / 10 ** 8,
  );

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
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
        After destroying this spore, you will be able to get ~{amount} CKB back
        in your wallet. This action cannot be undone.
      </Text>

      {error && (
        <Text size="sm" color="functional.0" mt="md">
          {getFriendlyErrorMessage(error.message)}
        </Text>
      )}

      <Flex direction="row" justify="flex-end">
        <Group>
          <Button
            classNames={{ root: classes.cancel, label: classes.label }}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            className={classes.destory}
            onClick={handleSubmit}
            loading={loading}
          >
            Confirm
          </Button>
        </Group>
      </Flex>
    </Box>
  );
}
