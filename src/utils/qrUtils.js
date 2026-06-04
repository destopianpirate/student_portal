import jsQR from 'jsqr';
import QRCode from 'qrcode';

/**
 * Scans a file (Blob/File) for a QR code.
 * Returns the decoded text if found, or throws an error.
 */
export const scanQrCodeFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        try {
          const imageData = context.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          
          if (code) {
            resolve(code.data);
          } else {
            reject(new Error('No QR code detected. Make sure the image is clear, well-lit, and the QR is fully visible.'));
          }
        } catch (err) {
          reject(new Error('Failed to extract image pixels: ' + err.message));
        }
      };
      img.onerror = () => reject(new Error('Failed to load image file.'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
};

/**
 * Generates a black-and-white vector SVG QR code from text.
 * Returns a Base64 SVG Data URL.
 */
export const generateVectorQrCode = async (text) => {
  try {
    const svgString = await QRCode.toString(text, {
      type: 'svg',
      margin: 2,
      color: {
        dark: '#000000', // Black modules
        light: '#FFFFFF' // White background
      }
    });
    // Convert SVG string to base64 Data URI safely
    const base64Svg = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    return base64Svg;
  } catch (err) {
    throw new Error('Failed to generate vector QR code: ' + err.message);
  }
};
