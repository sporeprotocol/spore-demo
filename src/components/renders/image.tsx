import { Spore } from '@/spore';
import { BI } from '@ckb-lumos/lumos';
import {
  Text,
  AspectRatio,
  Box,
  Center,
  Image,
  Overlay,
  createStyles,
  em,
  getBreakpointValue,
  useMantineTheme,
  MediaQuery,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';

export interface ImageSporeRenderProps {
  spore: Spore;
  ratio?: number;
}

const useStyles = createStyles((_, params?: { pixelated: boolean }) => ({
  image: {
    imageRendering: params?.pixelated ? 'pixelated' : 'auto',
  },
  figure: {
    width: '100%',
  },
}));

export default function ImageSporeRender(props: ImageSporeRenderProps) {
  const { spore, ratio = 1 } = props;
  const capacity = useMemo(
    () => BI.from(spore.cell.cellOutput.capacity ?? 0).toNumber(),
    [spore],
  );
  const { classes } = useStyles({ pixelated: capacity < 10_000 * 10 ** 8 });

  return (
    <AspectRatio ratio={ratio} bg="#F4F5F9">
      <Image
        alt={spore.id}
        src={`/api/v1/media/${spore.id}`}
        classNames={{
          image: classes.image,
          figure: classes.figure,
        }}
      />
    </AspectRatio>
  );
}

export interface ImagePreviewRenderProps {
  content: Blob;
  onClick: () => void;
  ratio?: number;
  loading?: boolean;
}

const usePreviewStyles = createStyles(
  (theme, params?: { pixelated: boolean }) => ({
    imageContainer: {
      borderColor: theme.colors.text[0],
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      backgroundColor: theme.colors.background[1],
    },
    image: {
      width: '616px',
      height: '260px',
      imageRendering: params?.pixelated ? 'pixelated' : 'auto',

      [`@media (max-width: ${em(getBreakpointValue(theme.breakpoints.xs))})`]: {
        width: 'auto',
      },
    },
    change: {
      height: '48px',
      minWidth: '132px',
      borderColor: theme.colors.text[0],
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '6px',
      cursor: 'pointer',
    },
  }),
);

export function ImagePreviewRender(props: ImagePreviewRenderProps) {
  const { content, loading, onClick } = props;
  const theme = useMantineTheme();
  const largerThanXS = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const [hovered, setHovered] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | ArrayBuffer | null>(null);
  const { classes } = usePreviewStyles({
    pixelated: (content?.size ?? 0) < 10_000,
  });

  useEffect(() => {
    const reader = new window.FileReader();
    reader.readAsDataURL(content);
    reader.onloadend = () => {
      setDataUrl(reader.result);
    };
  }, [content]);

  if (!dataUrl) {
    return null;
  }

  return (
    <Box
      className={classes.imageContainer}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AspectRatio ratio={(largerThanXS ? 616 : 295) / 260}>
        <Image
          width="100%"
          height="260px"
          className={classes.image}
          src={dataUrl.toString()}
          alt="preview"
          fit="contain"
        />
        {hovered && !loading && (
          <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
            <Overlay color="#E0E0E0" opacity={0.7} sx={{ borderRadius: '6px' }}>
              <Center className={classes.change} onClick={onClick}>
                <Text color="text.0" weight="bold">
                  Change Image
                </Text>
              </Center>
            </Overlay>
          </MediaQuery>
        )}
      </AspectRatio>
    </Box>
  );
}
