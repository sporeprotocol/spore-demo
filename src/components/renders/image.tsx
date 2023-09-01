import { Spore } from '@/spore';
import { BI } from '@ckb-lumos/lumos';
import { AspectRatio, Image, createStyles } from '@mantine/core';
import { useMemo } from 'react';

export interface ImageRenderProps {
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

export default function ImageRender(props: ImageRenderProps) {
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
