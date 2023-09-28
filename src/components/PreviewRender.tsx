import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { ImagePreviewRender } from "./renders/image";
import { TEXT_MIME_TYPE, getMIMETypeByName } from "@/utils/mime";
import { TextPreviewRender } from "./renders/text";

export default function PreviewRender({ content }: { content: Blob }) {
  const contentType = content.type || getMIMETypeByName(content.name);

  if (IMAGE_MIME_TYPE.includes(contentType as any)) {
    return <ImagePreviewRender content={content} />
  }
  if (TEXT_MIME_TYPE.includes(contentType as any)) {
    return <TextPreviewRender content={content} />
  }
}
