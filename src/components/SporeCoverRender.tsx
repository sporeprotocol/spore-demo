import { ImageSporeCoverRender } from './renders/image';
import { Spore } from '@/spore';
import { TextSporeCoverRender } from './renders/text';
import { isImageMIMEType, isTextMIMEType } from '@/utils/mime';

export interface SporeRenderProps {
  spore: Spore;
  ratio?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function SporeCoverRender({ spore, ratio, size }: SporeRenderProps) {
  if (isImageMIMEType(spore.contentType)) {
    return <ImageSporeCoverRender spore={spore} ratio={ratio} />;
  }

  if (isTextMIMEType(spore.contentType)) {
    return <TextSporeCoverRender spore={spore} ratio={ratio} size={size} />;
  }

  return null;
}