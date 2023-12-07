import { QuerySpore } from '@/hooks/query/type';
import { ImageSporeCoverRender } from './renders/image';
import { TextSporeCoverRender } from './renders/text';
import { isImageMIMEType, isTextMIMEType } from '@/utils/mime';
import { AspectRatio } from '@mantine/core';

export interface SporeRenderProps {
  spore: QuerySpore;
  ratio?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function SporeCoverRender({
  spore,
  ratio,
  size,
}: SporeRenderProps) {
  if (isImageMIMEType(spore.contentType)) {
    return <ImageSporeCoverRender spore={spore} ratio={ratio} />;
  }

  if (isTextMIMEType(spore.contentType)) {
    return <TextSporeCoverRender spore={spore} ratio={ratio} size={size} />;
  }

  return <AspectRatio ratio={ratio ?? 1} bg="#F4F5F9"></AspectRatio>;
}
