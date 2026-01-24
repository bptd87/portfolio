import { createClient } from '../utils/supabase/client';

// Use the singleton client from utils/supabase/client
export const supabase = createClient();

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket (e.g., 'portfolio', 'blog', 'software')
 * @param path - Optional path within the bucket (e.g., 'projects/mdq/')
 * @returns The public URL of the uploaded file
 */
export async function uploadImage(
  file: File,
  bucket: string,
  path: string = ''
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { url: urlData.publicUrl, error: null };
  } catch (err) {
    console.error('Upload exception:', err);
    return { url: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket
 * @param filePath - The full path to the file
 */
export async function deleteImage(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Delete exception:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * List all files in a bucket
 * @param bucket - The storage bucket
 * @param path - Optional path within the bucket
 */
export async function listImages(
  bucket: string,
  path: string = ''
): Promise<{ files: any[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('List error:', error);
      return { files: null, error: error.message };
    }

    return { files: data, error: null };
  } catch (err) {
    console.error('List exception:', err);
    return { files: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Get public URL for a file
 * @param bucket - The storage bucket
 * @param filePath - The full path to the file
 */
export function getImageUrl(bucket: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}

/**
 * Ensure storage buckets exist, creating them if necessary via server endpoint
 * @param bucketNames - Array of bucket names to ensure exist
 */
export async function ensureBucketsExist(
  bucketNames: string[]
): Promise<{ success: boolean; created: string[]; skipped: string[]; errors: string[] }> {
  try {
    const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-74296234/storage/ensure-buckets`;
    
    console.log('📡 Calling server to ensure buckets exist:', bucketNames);
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ bucketNames })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server response not OK:', response.status, errorText);
      return {
        success: false,
        created: [],
        skipped: [],
        errors: [`Server error: ${response.status} ${errorText}`]
      };
    }

    const result = await response.json();
    console.log('✅ Server response:', result);
    
    return {
      success: result.success || false,
      created: result.created || [],
      skipped: result.skipped || [],
      errors: result.errors || []
    };
  } catch (err) {
    console.error('❌ Exception calling server:', err);
    return {
      success: false,
      created: [],
      skipped: [],
      errors: [err instanceof Error ? err.message : 'Unknown error']
    };
  }
}