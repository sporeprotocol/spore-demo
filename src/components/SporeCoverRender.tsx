import { IMAGE_MIME_TYPE } from '@mantine/dropzone';
import ImageSporeRender from './renders/image';
import { Spore } from '@/spore';
import { TEXT_MIME_TYPE } from '@/utils/mime';
import TextSporeRender from './renders/text';

export default function SporeCoverRender({ spore }: { spore: Spore }) {
  if (IMAGE_MIME_TYPE.includes(spore.contentType as any)) {
    return <ImageSporeRender spore={spore} />;
  }

  if (TEXT_MIME_TYPE.includes(spore.contentType as any)) {
    return <TextSporeRender spore={spore} />;
  }

  return null;
}
