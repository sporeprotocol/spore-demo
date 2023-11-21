import 'react-loading-skeleton/dist/skeleton.css';
import { Box, Group, createStyles } from '@mantine/core';
import { ImageSporeContentRender } from './renders/image';
import { IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { TEXT_MIME_TYPE, isImageMIMEType, isTextMIMEType } from '@/utils/mime';
import { TextSporeContentRender } from './renders/text';
import { Spore } from 'spore-graphql';

const useStyles = createStyles((theme) => ({
  image: {
    width: '100%',
    height: '100%',
    maxWidth: '468px',
    maxWeight: '468px',
    borderRadius: '8px',
    borderColor: theme.colors.text[0],
    borderStyle: 'solid',
    borderWidth: '1px',
    boxShadow: '4px 4px 0 #111318',
    backgroundColor: theme.colors.background[1],
    overflow: 'hidden',

    [theme.fn.smallerThan('sm')]: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
}));

export default function SporeContentRender({
  spore,
}: {
  spore: Spore | undefined;
}) {
  const { classes } = useStyles();

  if (!spore) {
    return null;
  }

  if (isImageMIMEType(spore!.contentType)) {
    return (
      <Group position="center">
        <Box className={classes.image}>
          <ImageSporeContentRender spore={spore} />
        </Box>
      </Group>
    );
  }

  if (isTextMIMEType(spore!.contentType)) {
    return <TextSporeContentRender spore={spore} />;
  }

  return null;
}
