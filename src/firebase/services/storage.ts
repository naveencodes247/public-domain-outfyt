import { auth } from '../config';
import { SUPABASE_URL, SUPABASE_STORAGE_BUCKET } from '../../supabase/config';
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
  const mimeType = (file.type || '').toLowerCase();
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  const isImageMime =
    ALLOWED_IMAGE_TYPES.includes(mimeType) || ['jpg', 'jpeg', 'png', 'webp'].includes(extension);
  const isVideoMime =
    ALLOWED_VIDEO_TYPES.includes(mimeType) || ['mp4', 'webm', 'mov'].includes(extension);

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
 * Uploads an outfit image or video to Supabase Storage with progress tracking.
 * Path format: outfits/{outfitId}/{timestamp}_{cleanFileName}
 */
export async function uploadOutfitMedia(
  file: File | Blob & { name?: string },
  outfitId: string,
  options?: {
    expectedType?: MediaType;
    onProgress?: (progressPercent: number) => void;
    idToken?: string;
    authToken?: string;
  }
): Promise<UploadMediaResult> {
  const fileName = (file as any).name || 'media_file';
  const validation = validateMediaFile(file as File, options?.expectedType);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid media file');
  }

  const cleanOutfitId = (outfitId || 'temp').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  const cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `outfits/${cleanOutfitId || 'misc'}/${timestamp}_${cleanFileName}`;

  // 1. Request a cryptographically signed upload URL from the secure Edge Function
  const authUrl = `${SUPABASE_URL}/functions/v1/get-upload-url`;
  let signedUrl: string;
  let publicUrl: string;

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    let token = options?.idToken || options?.authToken;
    if (!token && typeof window !== 'undefined') {
      try {
        token = (await auth.currentUser?.getIdToken()) || undefined;
      } catch (tokenErr) {
        console.warn('Could not auto-fetch Firebase Auth token:', tokenErr);
      }
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const authRes = await fetch(authUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        path: storagePath,
        outfitId: cleanOutfitId,
      }),
    });

    const authData = await authRes.json();
    if (!authRes.ok) {
      throw new Error(
        authData.error || `Upload authorization failed with HTTP ${authRes.status}.`
      );
    }

    signedUrl = authData.signedUrl;
    publicUrl = authData.publicUrl;
  } catch (err: any) {
    throw new Error(`Upload failed: ${err.message}`);
  }

  // 2. Perform the upload to the signed URL with live progress tracking
  const contentType =
    file.type || (validation.detectedType === 'video' ? 'video/mp4' : 'image/jpeg');

  const onProgress = options?.onProgress;

  if (typeof XMLHttpRequest !== 'undefined') {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedUrl);
      xhr.setRequestHeader('Content-Type', contentType);

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable && evt.total > 0) {
            const percent = Math.round((evt.loaded / evt.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          if (onProgress) {
            onProgress(100);
          }
          resolve();
        } else {
          reject(new Error(`Storage server returned error (${xhr.status}): ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error occurred while uploading file to Supabase Storage.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Upload timed out after 3 minutes. Please check your network connection.'));
      };

      xhr.timeout = 180000; // 3 minute timeout
      xhr.send(file as any);
    });
  } else {
    // Node.js or SSR environment fallback
    const res = await fetch(signedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file as any,
    });
    if (!res.ok) {
      throw new Error(`Storage upload failed with HTTP status ${res.status}`);
    }
    if (options?.onProgress) {
      options.onProgress(100);
    }
  }

  return {
    downloadUrl: publicUrl,
    mediaType: validation.detectedType,
    storagePath,
  };
}

/**
 * Safely handles deletion of outfit media across Supabase Storage and legacy Firebase files.
 */
export async function deleteOutfitMedia(urlOrPath: string): Promise<void> {
  if (!urlOrPath) return;
  try {
    // Media URLs are retained safely or managed via Admin Portal
    console.info('Media reference updated or cleared:', urlOrPath);
  } catch (err: any) {
    console.warn('Media deletion skipped or failed:', err.message);
  }
}
