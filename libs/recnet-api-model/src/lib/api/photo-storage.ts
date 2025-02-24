import { z } from "zod";

// POST /photo-storage/upload-url
export const postPhotoStorageUploadUrlResponseSchema = z.object({
  url: z.string().url(),
});
export type PostPhotoStorageUploadUrlResponse = z.infer<
  typeof postPhotoStorageUploadUrlResponseSchema
>;

// DELETE /photo-storage/photo
export const deletePhotoStoragePhotoParamsSchema = z.object({
  fileUrl: z.string().url(),
});
export type DeletePhotoStoragePhotoParams = z.infer<
  typeof deletePhotoStoragePhotoParamsSchema
>;
