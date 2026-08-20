export type UploadedImage = {
  key: string;
  public_url: string;
  signed_url: string;
  signed_url_expires_at: string;
  content_type: string;
  size: number;
  uploaded_at: string;
};

export const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
