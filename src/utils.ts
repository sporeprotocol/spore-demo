export const hexToBlob = (hex: string) => {
  const buffer = Buffer.from(hex, 'hex');
  return new Blob([buffer]);
};
