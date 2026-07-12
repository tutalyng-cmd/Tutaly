import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

// NOTE: This processor expects an image URL or buffer, processes it with sharp to strip EXIF,
// and should upload to a public CDN/storage bucket.
@Injectable()
@Processor('image-processing')
export class ImageProcessor {
  @Process('process-image')
  async handleProcessImage(job: Job<{ mediaId: string; url: string }>) {
    console.log(`[ImageProcessor] Processing image ${job.data.mediaId}`);

    try {
      // 1. Download image from temporary URL (e.g. presigned URL)
      const response = await fetch(job.data.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();

      // 2. Strip EXIF by default (sharp removes metadata unless withMetadata() is called)
      const processedBuffer = await sharp(Buffer.from(buffer))
        .rotate() // auto-orient based on EXIF before stripping
        .webp({ quality: 80 })
        .toBuffer();
      console.log(`Processed image size: ${processedBuffer.byteLength} bytes`);

      // 3. Upload to public CDN bucket
      // TODO: Implement S3/Supabase Storage upload here

      console.log(
        `[ImageProcessor] Image ${job.data.mediaId} processed successfully.`,
      );
    } catch (error) {
      console.error(
        `[ImageProcessor] Error processing image ${job.data.mediaId}:`,
        error,
      );
      throw error;
    }
  }
}
