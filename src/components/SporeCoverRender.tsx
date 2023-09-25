import { IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { ImageSporeCoverRender } from './renders/image';
import { Spore } from '@/spore';
import { TEXT_MIME_TYPE } from '@/utils/mime';
import { TextSporeCoverRender } from './renders/text';

export interface SporeRenderProps {
  spore: Spore;
  ratio?: number;
}

export default function SporeCoverRender({ spore, ratio }: SporeRenderProps) {
  if (IMAGE_MIME_TYPE.includes(spore.contentType as any)) {
    return <ImageSporeCoverRender spore={spore} ratio={ratio} />;
  }

  if (TEXT_MIME_TYPE.includes(spore.contentType as any)) {
    return <TextSporeCoverRender spore={spore} ratio={ratio} />;
  }

  return null;
}
