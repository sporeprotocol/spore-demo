import { getFriendlyErrorMessage } from '@/utils/error';
import { isValidAddress } from '@/utils/helpers';
import { Text, Button, Group, TextInput, createStyles } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCallback, useState } from 'react';

export interface TransferSporeModalProps {
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

export default function TransferSporeModal(props: TransferSporeModalProps) {
  const { onSubmit } = props;
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      to: '',
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
        await onSubmit(values);
        setLoading(false);
      } catch (err) {
        form.setFieldError('to', (err as Error).message);
        setLoading(false);
      }
    },
    [onSubmit, form],
  );

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        classNames={{
          root: classes.root,
          label: classes.label,
          input: classes.input,
          error: classes.error,
        }}
        label="Transfer to"
        placeholder="e.g. ckt1q7eiwlwk...3cv86p9wcmwejo32owejwp"
        withAsterisk
        {...form.getInputProps('to')}
      />
      <Group position="right" mt={'32px'}>
        <Button className={classes.submit} type="submit" loading={loading}>
          Submit
        </Button>
      </Group>
    </form>
  );
}