/**
 * Avatar Utilities — shared across Navbar, HomePage, SettingsPage
 * Handles: GDrive URL conversion, base64 photo, DiceBear fallback, image compression
 */

/**
 * Convert various Google Drive sharing URLs to a direct thumbnail/image URL.
 * Supports:
 *   - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 *   - https://drive.google.com/open?id=FILE_ID
 *   - https://drive.google.com/uc?id=FILE_ID
 */
export const convertGDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // Already a direct thumbnail URL
  if (url.includes('drive.google.com/thumbnail')) return url;

  let fileId = null;

  // Pattern 1: /file/d/FILE_ID/
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) fileId = match1[1];

  // Pattern 2: ?id=FILE_ID or &id=FILE_ID
  if (!fileId) {
    const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2) fileId = match2[1];
  }

  // Pattern 3: /d/FILE_ID (shorter variant)
  if (!fileId) {
    const match3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match3) fileId = match3[1];
  }

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }

  // Not a GDrive URL, return as-is
  return url;
};

/**
 * Get the display avatar URL from a user profile object.
 * Priority: base64 photo > custom URL (GDrive-converted) > DiceBear avatar > default DiceBear
 */
export const getAvatarUrl = (profile, email) => {
  if (profile?.profilePhotoBase64) return profile.profilePhotoBase64;
  if (profile?.customPhotoUrl) return convertGDriveUrl(profile.customPhotoUrl);
  if (profile?.avatarUrl) return profile.avatarUrl;
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${email || 'default'}`;
};

/**
 * Get object-position CSS value from profile photo position data.
 */
export const getPhotoPosition = (profile) => {
  const x = profile?.photoPositionX ?? 50;
  const y = profile?.photoPositionY ?? 50;
  return `${x}% ${y}%`;
};

/**
 * Compress and convert an image file to base64 string.
 * Resizes to maxDim x maxDim (default 400px) to keep Firestore doc size reasonable.
 * Returns a promise that resolves to the base64 data URL string.
 */
export const compressImageToBase64 = (file, maxDim = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;

        // Scale down if larger than maxDim
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        // Use JPEG for photos (smaller), PNG for transparent
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};
