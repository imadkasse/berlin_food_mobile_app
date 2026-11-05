/**
 * Storage service.
 *
 * Ported from the web app: `client/src/api/storage.ts`.
 *
 * The web app uploads a browser `File` object; React Native has no `File`, so
 * the mobile version accepts the `{ uri, name, type }` descriptor produced by
 * `expo-image-picker` (or any other native picker). The generated object key
 * keeps the web app's naming scheme (`<random>_<timestamp>.<ext>`) and the
 * bucket stays `menu_items`.
 *
 * Because a React Native `uri` is a `file://` string and not binary data, the
 * file is read from disk and converted to an `ArrayBuffer` before it is
 * uploaded — otherwise the literal URI text would be stored as the image.
 */

import { supabase } from './supabase';
import { ServiceError, toServiceError } from './supabase/query';

/** Bucket used by the web app for menu item and category images. */
export const STORAGE_BUCKET = 'menu_items';

/**
 * React Native file descriptor.
 *
 * `uri` points at the local file, `name` is the original file name (used to
 * derive the extension) and `type` is the MIME type.
 */
export type RNFile = {
  uri: string;
  name?: string;
  type?: string;
};

function getExtension(file: RNFile): string {
  // Strip a query string / hash so `photo.jpg?width=200` still yields `jpg`.
  const source = (file.name ?? file.uri).split(/[?#]/)[0];
  const lastDot = source.lastIndexOf('.');

  if (lastDot === -1 || lastDot === source.length - 1) {
    return 'jpg';
  }

  return source.slice(lastDot + 1);
}

/**
 * Reads the local file into a binary buffer.
 *
 * React Native has no `File`/`Blob` object, so the bytes are fetched from the
 * local URI and converted to an `ArrayBuffer`. Older React Native polyfills do
 * not expose `Response.arrayBuffer()`, so we fall back to `Response.blob()`
 * and re-read the blob through a fresh `Response`.
 */
async function readFileAsArrayBuffer(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`Failed to read the selected file (status ${response.status}).`);
  }

  if (typeof response.arrayBuffer === 'function') {
    return response.arrayBuffer();
  }

  const blob = await response.blob();
  return new Response(blob).arrayBuffer();
}

/**
 * Mirrors `api/storage.ts` → `uploadFile()`.
 *
 * Uploads the file into the `menu_items` bucket and returns its public URL.
 *
 * The web app hands a browser `File` straight to Supabase. React Native only
 * has a `file://` URI, and Supabase's `storage-js` uploads anything that is not
 * a `Blob`/`FormData` verbatim as the request body — passing the URI would
 * store the *text* of the URI instead of the image. The file is therefore read
 * from disk and converted to binary before the upload.
 */
export async function uploadFile(file: RNFile): Promise<string> {
  const fileExt = getExtension(file);
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

  let arrayBuffer: ArrayBuffer;

  try {
    arrayBuffer = await readFileAsArrayBuffer(file.uri);
  } catch {
    throw new ServiceError({ message: 'Failed to read the selected file.' });
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, arrayBuffer, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type ?? 'image/jpeg',
  });

  if (error) {
    throw toServiceError(error, 'Failed to upload image');
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);

  return publicUrl;
}

/**
 * Mirrors `api/storage.ts` → `deleteImage()`.
 *
 * Never throws: the web app swallows storage errors here (it only logs them) so
 * that a failed image cleanup cannot break the surrounding admin flow.
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    const fileName = url.split('/').pop();
    if (!fileName) return;

    if (url.includes('storage/v1/object/public/menu_items')) {
      const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);

      if (error) {
        // Intentionally swallowed — mirrors the web app's non-throwing behaviour.
        return;
      }
    }
  } catch {
    // Intentionally swallowed — mirrors the web app's non-throwing behaviour.
  }
}
