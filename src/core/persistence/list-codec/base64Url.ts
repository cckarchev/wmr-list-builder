/** Base64 encodes in 4-character blocks; the url-safe form drops the padding. */
const BASE64_BLOCK_LENGTH = 4;

export const toBase64Url = (s: string): string =>
  btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const fromBase64Url = (s: string): string => {
  const overflow = s.length % BASE64_BLOCK_LENGTH;
  const missing = overflow === 0 ? 0 : BASE64_BLOCK_LENGTH - overflow;
  const pad = '='.repeat(missing);

  return atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
};
