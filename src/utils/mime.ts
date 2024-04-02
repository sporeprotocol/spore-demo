import { IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { decodeContentType } from "@spore-sdk/core";

export { IMAGE_MIME_TYPE };
export const TEXT_MIME_TYPE = ["text/markdown", "text/plain"];
export const VIDEO_MIME_TYPE = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export const SUPPORTED_MIME_TYPE = [...IMAGE_MIME_TYPE, ...TEXT_MIME_TYPE, ...VIDEO_MIME_TYPE];

export function getMIMETypeByName(name: string) {
  const extension = name.split(".").pop();

  if (extension === "md") {
    return "text/markdown";
  }
  if (extension === "txt") {
    return "text/plain";
  }
  return "";
}

export function isSupportedMIMEType(contentType: string | undefined | null) {
  if (!contentType) {
    return false;
  }
  const { type, subtype } = decodeContentType(contentType);
  return SUPPORTED_MIME_TYPE.includes(`${type}/${subtype}`);
}

export function isImageMIMEType(contentType: string | undefined | null) {
  if (!contentType) {
    return false;
  }

  const compatibleContentType = contentType.replace("+spore", "");

  const { type, subtype } = decodeContentType(compatibleContentType);
  return IMAGE_MIME_TYPE.includes(`${type}/${subtype}` as any);
}

export function isTextMIMEType(contentType: string | undefined | null) {
  if (!contentType) {
    return false;
  }
  const { type, subtype } = decodeContentType(contentType);
  return TEXT_MIME_TYPE.includes(`${type}/${subtype}`);
}

export function isVideoMIMEType(contentType: string | undefined | null) {
  if (!contentType) {
    return false;
  }
  const { type, subtype } = decodeContentType(contentType);
  return VIDEO_MIME_TYPE.includes(`${type}/${subtype}`);
}
