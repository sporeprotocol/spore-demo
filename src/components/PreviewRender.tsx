import { ImagePreviewRender } from "./renders/image";
import { getMIMETypeByName, isImageMIMEType, isTextMIMEType, isVideoMIMEType } from "@/utils/mime";
import { TextPreviewRender } from "./renders/text";
import { VideoPreviewRender } from "./renders/video";

export default function PreviewRender({ content }: { content: Blob }) {
  const contentType = content.type || getMIMETypeByName(content.name);

  if (isImageMIMEType(contentType)) {
    return <ImagePreviewRender content={content} />;
  }
  if (isTextMIMEType(contentType)) {
    return <TextPreviewRender content={content} />;
  }
  if (isVideoMIMEType(contentType)) {
    return <VideoPreviewRender content={content} />;
  }
}
