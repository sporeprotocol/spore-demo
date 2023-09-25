import { IMAGE_MIME_TYPE } from '@mantine/dropzone';

export { IMAGE_MIME_TYPE };
export const TEXT_MIME_TYPE = ['text/markdown', 'text/plain'];

export const SUPPORTED_MIME_TYPE = [...IMAGE_MIME_TYPE, ...TEXT_MIME_TYPE];

export function getMIMETypeByName(name: string) {
  const extension = name.split('.').pop();

  if (extension === 'md') {
    return 'text/markdown';
  }
  if (extension === 'txt') {
    return 'text/plain';
  }
  return '';
}
