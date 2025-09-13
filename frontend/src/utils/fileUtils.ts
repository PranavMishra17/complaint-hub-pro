const ALLOWED_MIME_TYPES = [
  'text/plain',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 2;

// File signature validation (magic numbers)
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/jpg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
  'text/plain': null // Text files don't have a consistent signature
};

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = async (file: File): Promise<FileValidationResult> => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds 5MB limit. Current size: ${formatFileSize(file.size)}`
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: `File type not allowed. Supported types: TXT, PDF, PNG, JPG, JPEG`
    };
  }

  // Validate file signature for binary files
  if (file.type !== 'text/plain') {
    const isValidSignature = await validateFileSignature(file);
    if (!isValidSignature) {
      return {
        isValid: false,
        error: `File signature doesn't match the declared file type`
      };
    }
  }

  return { isValid: true };
};

export const validateFiles = async (files: File[]): Promise<FileValidationResult> => {
  if (files.length > MAX_FILES) {
    return {
      isValid: false,
      error: `Maximum ${MAX_FILES} files allowed`
    };
  }

  for (const file of files) {
    const result = await validateFile(file);
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
};

const validateFileSignature = async (file: File): Promise<boolean> => {
  const signature = FILE_SIGNATURES[file.type as keyof typeof FILE_SIGNATURES];
  if (!signature) return true; // No signature validation needed

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      if (!buffer) {
        resolve(false);
        return;
      }

      const bytes = new Uint8Array(buffer, 0, signature.length);
      const matches = signature.every((byte, index) => bytes[index] === byte);
      resolve(matches);
    };
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, signature.length));
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (mimeType: string): string => {
  switch (mimeType) {
    case 'application/pdf':
      return '📄';
    case 'text/plain':
      return '📝';
    case 'image/png':
    case 'image/jpeg':
    case 'image/jpg':
      return '🖼️';
    default:
      return '📎';
  }
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

// Strip metadata from images (basic implementation)
export const stripImageMetadata = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/')) {
    return file; // Return as-is for non-images
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const strippedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          resolve(strippedFile);
        } else {
          resolve(file); // Fallback to original file
        }
      }, file.type, 0.95); // Slightly compress to ensure metadata removal
    };

    img.onerror = () => {
      resolve(file); // Fallback to original file
    };

    img.src = URL.createObjectURL(file);
  });
};

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || '';
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${timestamp}_${random}_${sanitizedName}.${extension}`;
};