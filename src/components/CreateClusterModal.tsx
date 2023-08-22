import {
  Text,
  Flex,
  TextInput,
  Group,
  Button,
  createStyles,
  Radio,
} from '@mantine/core';
import { useForm } from '@mantine/form';

export interface CreateClusterModalProps {
  onSubmit: (values: {
    name: string;
    description: string;
    public: string;
  }) => void;
  isLoading: boolean;
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
  const { onSubmit, isLoading } = props;
  const { classes } = useStyles();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      public: '0',
    },
  });

  return (
    <Flex direction="column">
      <Text color="text.1" mb="md">
        All cluster info will be stored on-chain and cannot be altered after
        creation.
      </Text>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <TextInput
          classNames={{
            root: classes.root,
            label: classes.label,
            input: classes.input,
          }}
          label="Name"
          placeholder="e.g. Ape collection"
          withAsterisk
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
            />
            <Radio
              value="1"
              color="brand.1"
              classNames={{ label: classes.radio }}
              label="Public. Anyone can mint Spores into this Cluster."
            />
          </Group>
        </Radio.Group>

        <Group position="right" mt="48px">
          <Button
            type="submit"
            className={classes.submit}
            loading={isLoading}
            disabled={!form.values['name'] || !form.values['description']}
          >
            Submit
          </Button>
        </Group>
      </form>
    </Flex>
  );
}
