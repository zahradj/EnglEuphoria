import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'teacher-applications';

/** Extract storage path from any cv_url shape (public URL, signed URL, or raw path). */
export function cvPathFromUrl(cvUrl: string): string | null {
  if (!cvUrl) return null;
  // Public URL: /object/public/teacher-applications/<path>
  let m = cvUrl.match(/\/object\/public\/teacher-applications\/([^?]+)/);
  if (m) return decodeURIComponent(m[1]);
  // Signed URL: /object/sign/teacher-applications/<path>?token=...
  m = cvUrl.match(/\/object\/sign\/teacher-applications\/([^?]+)/);
  if (m) return decodeURIComponent(m[1]);
  // Raw path stored
  if (!/^https?:\/\//i.test(cvUrl)) return cvUrl.replace(/^\/+/, '');
  return null;
}

/** Open the CV in a new tab using a short-lived signed URL (works for private bucket). */
export async function viewCv(cvUrl: string): Promise<void> {
  const path = cvPathFromUrl(cvUrl);
  if (!path) throw new Error('Could not parse CV path');
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 300);
  if (error || !data?.signedUrl) throw error ?? new Error('No signed URL');
  window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
}

/** Download the CV via the authenticated storage client. */
export async function downloadCv(cvUrl: string): Promise<void> {
  const path = cvPathFromUrl(cvUrl);
  if (!path) throw new Error('Could not parse CV path');
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) throw error ?? new Error('Download failed');
  const blobUrl = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = path.split('/').pop() || 'cv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}
