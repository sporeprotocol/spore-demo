import { ImagePreviewRender } from "./renders/image";
import { getMIMETypeByName, isImageMIMEType, isTextMIMEType } from "@/utils/mime";
import { TextPreviewRender } from "./renders/text";

export default function PreviewRender({ content }: { content: Blob }) {
  const contentType = content.type || getMIMETypeByName(content.name);

  if (isImageMIMEType(contentType)) {
    return <ImagePreviewRender content={content} />
  }
  if (isTextMIMEType(contentType)) {
    return <TextPreviewRender content={content} />
  }
}
