import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from '../config';
import { MediaType } from '../../types/schema';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  detectedType: MediaType;
}

/**
 * Validates media file MIME type, file extension, and file size limits.
 */
export function validateMediaFile(file: File, expectedType?: MediaType): ValidationResult {
  const mimeType = file.type.toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  const isImageMime = ALLOWED_IMAGE_TYPES.includes(mimeType) || ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  const isVideoMime = ALLOWED_VIDEO_TYPES.includes(mimeType) || ['mp4', 'webm', 'mov'].includes(extension);

  let detectedType: MediaType = isVideoMime ? 'video' : 'image';
  if (expectedType) {
    detectedType = expectedType;
  }

  if (detectedType === 'image') {
    if (!isImageMime) {
      return {
        valid: false,
        error: `Unsupported image format (${mimeType || extension}). Allowed formats: JPG/JPEG, PNG, WebP.`,
        detectedType: 'image',
      };
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Image file is too large (${sizeMB}MB). Maximum allowed size is 10MB.`,
        detectedType: 'image',
      };
    }
  } else {
    if (!isVideoMime) {
      return {
        valid: false,
        error: `Unsupported video format (${mimeType || extension}). Allowed formats: MP4, WebM, MOV.`,
        detectedType: 'video',
      };
    }
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Video file is too large (${sizeMB}MB). Maximum allowed size is 50MB.`,
        detectedType: 'video',
      };
    }
  }

  return { valid: true, detectedType };
}

export interface UploadMediaResult {
  downloadUrl: string;
  mediaType: MediaType;
  storagePath: string;
}

/**
 * Uploads an outfit image or video to Firebase Storage with progress tracking.
 * Path format: outfits/{outfitId}/{timestamp}_{cleanFileName}
 */
export async function uploadOutfitMedia(
  file: File,
  outfitId: string,
  options?: {
    expectedType?: MediaType;
    onProgress?: (progressPercent: number) => void;
  }
): Promise<UploadMediaResult> {
  const validation = validateMediaFile(file, options?.expectedType);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid media file');
  }

  const cleanOutfitId = (outfitId || 'temp').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `outfits/${cleanOutfitId || 'misc'}/${timestamp}_${cleanFileName}`;

  const storageRef = ref(storage, storagePath);
  const metadata = {
    contentType: file.type || (validation.detectedType === 'video' ? 'video/mp4' : 'image/jpeg'),
    customMetadata: {
      outfitId: cleanOutfitId,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    },
  };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0 && options?.onProgress) {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          options.onProgress(percent);
        }
      },
      (error: any) => {
        let friendlyMessage = `Upload failed: ${error.message}`;
        if (error.code === 'storage/unauthorized') {
          friendlyMessage =
            'Storage permission denied: Please verify that you are signed in with an authorized administrator account and that Firebase Storage security rules are deployed.';
        } else if (error.code === 'storage/quota-exceeded') {
          friendlyMessage = 'Storage quota exceeded: The storage bucket limit has been reached.';
        } else if (error.code === 'storage/canceled') {
          friendlyMessage = 'Upload was cancelled by user.';
        } else if (error.code === 'storage/bucket-not-found') {
          friendlyMessage =
            'Firebase Storage bucket not found: Please ensure Firebase Storage is enabled in the Firebase Console for this project.';
        }
        reject(new Error(friendlyMessage));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            downloadUrl,
            mediaType: validation.detectedType,
            storagePath,
          });
        } catch (urlError: any) {
          reject(new Error(`Failed to retrieve media URL: ${urlError.message}`));
        }
      }
    );
  });
}

/**
 * Safely deletes a file from Firebase Storage if it belongs to our bucket.
 */
export async function deleteOutfitMedia(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  try {
    if (urlOrPath.includes('firebasestorage.googleapis.com') || urlOrPath.startsWith('outfits/')) {
      const storageRef = ref(storage, urlOrPath);
      await deleteObject(storageRef);
    }
  } catch (err: any) {
    // If already removed or not found, ignore error
    console.warn('Storage deletion skipped or failed:', err.message);
  }
}
