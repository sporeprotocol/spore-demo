import { getFriendlyErrorMessage } from '@/utils/error';
import {
  Text,
  Flex,
  TextInput,
  Group,
  Button,
  createStyles,
  Radio,
  useMantineTheme,
  Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFocusTrap, useMediaQuery } from '@mantine/hooks';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import Popover from './Popover';

export interface CreateClusterModalProps {
  onSubmit: (
    values: {
      name: string;
      description: string;
      public: string;
    },
    useCapacityMargin?: boolean,
  ) => Promise<void>;
}

const useStyles = createStyles((theme) => ({
  root: {
    marginBottom: '24px',
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

    [`@media (max-width: ${theme.breakpoints.sm})`]: {
      height: '48px',
    },
  },
  radio: {
    color: theme.colors.text[0],
  },
  submit: {
    backgroundColor: theme.colors.brand[1],
    '&:hover': {
      backgroundColor: '#7F6BD1',
    },
  },
}));

export default function CreateClusterModal(props: CreateClusterModalProps) {
  const { onSubmit } = props;
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [useCapacityMargin, setUseCapacityMargin] = useState(true);
  const focusTrapRef = useFocusTrap();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      public: '0',
    },
  });

  const handleSubmit = useCallback(
    async (values: { name: string; description: string; public: string }) => {
      try {
        setLoading(true);
        setError(null);
        await onSubmit(values, useCapacityMargin);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [onSubmit],
  );

  return (
    <Flex direction="column">
      <Text color="text.1" mb="md">
        All cluster info will be stored on-chain and cannot be altered after
        creation.
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)} ref={focusTrapRef}>
        <TextInput
          classNames={{
            root: classes.root,
            label: classes.label,
            input: classes.input,
          }}
          label="Name"
          placeholder="e.g. Ape collection"
          withAsterisk
          disabled={loading}
          data-autofocus
          {...form.getInputProps('name')}
        />

        <TextInput
          classNames={{
            root: classes.root,
            label: classes.label,
            input: classes.input,
          }}
          label="Description"
          withAsterisk
          disabled={loading}
          {...form.getInputProps('description')}
        />

        <Radio.Group
          name="public"
          label="Preference"
          classNames={{ label: classes.label }}
          withAsterisk
          {...form.getInputProps('public')}
        >
          <Group mt="xs">
            <Radio
              value="0"
              color="brand.1"
              classNames={{ label: classes.radio }}
              label="Private. Only you can mint Spores into this Cluster."
              disabled={loading}
            />
            <Radio
              value="1"
              color="brand.1"
              classNames={{ label: classes.radio }}
              label="Public. Anyone can mint Spores into this Cluster."
              disabled={loading}
            />
          </Group>
        </Radio.Group>
        {error && (
          <Text size="sm" color="functional.0" mt="md">
            {getFriendlyErrorMessage(error.message)}
          </Text>
        )}
        <Group position="apart" mt={error ? '24px' : '48px'}>
          <Group spacing="xs">
            <Checkbox
              checked={useCapacityMargin}
              onChange={(e) => setUseCapacityMargin(e.target.checked)}
            />
            <Text>Enable Zero-Fee Transfers</Text>
            <Popover label="By checking this option, you allocate 1 CKB to sponsor future transfers, covering around 100,000 transfers. You can manage this feature on this Spore's info page.">
              <Image
                src="/svg/icon-info.svg"
                alt="info"
                width="20"
                height="20"
              />
            </Popover>
          </Group>
          <Button
            type="submit"
            className={classes.submit}
            loading={loading}
            disabled={!form.values['name'] || !form.values['description']}
            fullWidth={isMobile}
          >
            Create
          </Button>
        </Group>
      </form>
    </Flex>
  );
}
