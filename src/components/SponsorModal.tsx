import Image from 'next/image';
import { Cluster } from '@/cluster';
import { Spore } from '@/spore';
import { getFriendlyErrorMessage } from '@/utils/error';
import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  Button,
  Group,
  Stack,
  createStyles,
  useMantineTheme,
  NumberInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useFocusTrap, useMediaQuery } from '@mantine/hooks';
import { useCallback, useMemo, useState } from 'react';

export type TransferModalProps =
  | {
      onSubmit: (values: { amount: number }) => Promise<void>;
    } & (
      | {
          type: 'spore';
          data: Spore;
        }
      | {
          type: 'cluster';
          data: Cluster;
        }
    );

const useStyles = createStyles((theme) => ({
  root: {
    flexGrow: 1,

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
    height: '48px',
    paddingRight: '48px',

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
  rightSection: {
    width: '48px',
  },
  submit: {
    backgroundColor: theme.colors.brand[1],
    '&:hover': {
      backgroundColor: '#7F6BD1',
    },
  },
}));

export default function SponsorModal(props: TransferModalProps) {
  const { type, onSubmit, data } = props;
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const focusTrapRef = useFocusTrap();

  const form = useForm({
    initialValues: {
      amount: 1,
    },
  });

  const handleSubmit = useCallback(
    async (values: { amount: number }) => {
      try {
        setLoading(true);
        setError(null);
        await onSubmit(values);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    },
    [onSubmit],
  );

  const size = useMemo(() => {
    if (!data) {
      return 0;
    }
    const capacity = BI.from(data.cell.cellOutput.capacity).toNumber();
    return Math.floor(capacity / 100_000_000);
  }, [data]);

  return (
    <Stack>
      <Text color="text.1">
        {type === 'spore'
          ? `Sponsoring additional CKB for this Spore enables Zero-Fee Transfers and enhances your Spore's value as it grows with on-chain usage.`
          : `Enable Zero-Fee Transfers by adding CKB to this Cluster to sponsor future transfers.`}
      </Text>
      <form onSubmit={form.onSubmit(handleSubmit)} ref={focusTrapRef}>
        <Group w="100%" align="center" mb="8px">
          <NumberInput
            type="number"
            classNames={{
              root: classes.root,
              label: classes.label,
              input: classes.input,
              error: classes.error,
              rightSection: classes.rightSection,
            }}
            autoFocus
            withAsterisk
            data-autofocus
            disabled={loading}
            precision={0}
            formatter={(val) => {
              const num = parseInt(val);
              if (isNaN(num)) {
                return '0';
              }
              return num.toString();
            }}
            parser={(val) => {
              const num = parseInt(val);
              setError(null);
              if (isNaN(num)) {
                return '0';
              }
              if (num < 0) {
                setError(new Error('Please enter a positive number'));
              }
              return Math.max(num, 0).toString();
            }}
            rightSection={
              <Group spacing="0px" w="40px" h="100%">
                <Stack
                  h="100%"
                  justify="center"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setError(null);
                    form.setValues({
                      amount: Math.max(form.values.amount - 1, 0),
                    });
                  }}
                >
                  <Image
                    src="/svg/icon-left.svg"
                    width="18"
                    height="18"
                    alt="sub"
                  />
                </Stack>
                <Stack
                  h="100%"
                  justify="center"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setError(null);
                    form.setValues({ amount: form.values.amount + 1 });
                  }}
                >
                  <Image
                    src="/svg/icon-right.svg"
                    width="18"
                    height="18"
                    alt="add"
                  />
                </Stack>
              </Group>
            }
            {...form.getInputProps('amount')}
          />
          <Text size="xl" color="text.0" weight="bold">
            CKB
          </Text>
        </Group>
        {form.values.amount > 0 && (
          <Text size="12px" color="text.1">
            Can support approximately {form.values.amount * 100000} future
            transfers
          </Text>
        )}
        {error && (
          <Text size="sm" color="functional.0">
            {getFriendlyErrorMessage(error.message)}
          </Text>
        )}
        <Stack spacing="0px" mt="24px">
          <Text color="text.0" weight="bold">
            {type === 'spore'
              ? "Spore's on-chain size"
              : "Cluster's on-chain size"}
          </Text>
          <Group spacing="4px" align="center">
            <Text color="text.0">{size.toLocaleString('en-US')} CKB</Text>
            {form.values.amount > 0 && (
              <>
                <Image
                  src="/svg/icon-arrow-right.svg"
                  alt="arrow-right"
                  width="18"
                  height="18"
                />
                <Text color="brand.1" weight="bold">
                  {(size + form.values.amount).toLocaleString('en-US')} CKB
                </Text>
              </>
            )}
          </Group>
        </Stack>

        <Group position="right" mt={'32px'}>
          <Button
            className={classes.submit}
            type="submit"
            loading={loading}
            fullWidth={isMobile}
            disabled={!form.values.amount}
          >
            Sponsor
          </Button>
        </Group>
      </form>
    </Stack>
  );
}
