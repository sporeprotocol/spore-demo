import { getFriendlyErrorMessage } from '@/utils/error';
import { isValidAddress } from '@/utils/helpers';
import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  Button,
  Group,
  Stack,
  TextInput,
  createStyles,
  useMantineTheme,
  Radio,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFocusTrap, useMediaQuery } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import Popover from './Popover';

export interface TransferModalProps {
  type: 'cluster' | 'spore';
  capacityMargin: string | undefined;
  onSubmit: (values: { to: string }) => Promise<void>;
}

const useStyles = createStyles((theme) => ({
  root: {
    marginBottom: '24px',

    'input[data-invalid]': {
      color: theme.colors.text[0],
      border: `2px solid ${theme.colors.functional[0]}`,
    },
  },
  label: {
    fontWeight: 'bold',
    color: theme.colors.text[0],
  },
  input: {
    border: '1px solid #CDCFD5',
    borderRadius: '8px',

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      height: '48px',
    },

    '&:focus': {
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: theme.colors.brand[1],
      boxShadow: '0px 0px 4px 0px rgba(109, 87, 203, 0.50)',
    },
  },
  error: {
    color: theme.colors.functional[0],
  },
  submit: {
    backgroundColor: theme.colors.brand[1],
    '&:hover': {
      backgroundColor: '#7F6BD1',
    },
  },
}));

export default function TransferModal(props: TransferModalProps) {
  const { type, onSubmit } = props;
  const capacityMargin = BI.from(props.capacityMargin || '0x0');
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const focusTrapRef = useFocusTrap();

  const form = useForm({
    initialValues: {
      to: '',
      useCapacityMarginAsFee: capacityMargin.toNumber() > 10000 ? '1' : '0',
    },
  });

  const handleSubmit = useCallback(
    async (values: { to: string }) => {
      try {
        if (!isValidAddress(values.to)) {
          form.setFieldError('to', '* Invalid Address');
          return;
        }

        setLoading(true);
        setError(null);
        await onSubmit(values);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [onSubmit, form],
  );

  return (
    <Stack>
      {type === 'cluster' && isMobile && (
        <Text color="text.1">
          Transferring this Cluster won’t affect the ownership of the Spores
          within it.
        </Text>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)} ref={focusTrapRef}>
        <TextInput
          classNames={{
            root: classes.root,
            label: classes.label,
            input: classes.input,
            error: classes.error,
          }}
          label="Transfer to"
          placeholder="e.g. ckt1q7eiwlwk...3cv86p9wcmwejo32owejwp"
          autoFocus
          withAsterisk
          data-autofocus
          {...form.getInputProps('to')}
        />
        <Radio.Group
          label="Select your preferred way"
          classNames={{
            label: classes.label,
          }}
          {...form.getInputProps('useCapacityMarginAsFee')}
        >
          <Stack spacing="8px" mt="4px">
            {capacityMargin.toNumber() === 0 ? (
              <Popover
                label={
                  <Text>
                    {`This ${type} has exhausted its Zero-Fee Transfer capacity or hasn't enabled this feature.`}
                  </Text>
                }
              >
                <Radio value="1" label="Zero-Fee Transfer" disabled />
              </Popover>
            ) : (
              <Radio
                value="1"
                label="Zero-Fee Transfer"
                disabled={BI.from(capacityMargin).toNumber() === 0}
              />
            )}

            <Radio value="0" label="Pay from my wallet" />
          </Stack>
        </Radio.Group>
        {error && (
          <Text size="sm" color="functional.0">
            {getFriendlyErrorMessage(error.message)}
          </Text>
        )}
        <Group position="right" mt={'32px'}>
          <Button
            className={classes.submit}
            type="submit"
            loading={loading}
            fullWidth={isMobile}
          >
            Transfer
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
