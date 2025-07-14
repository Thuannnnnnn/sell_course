// File validation utilities

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

// Simple sync validation for basic checks
export const validateImageFile = (file: File, maxSizeMB: number = 5): FileValidationResult => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Vui lòng chọn file hình ảnh (JPG, PNG, GIF, WebP)'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File quá lớn! Vui lòng chọn file nhỏ hơn ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
};

// Async validation with dimension checking
export const validateImageFileWithDimensions = (file: File, maxSizeMB: number = 5): Promise<FileValidationResult> => {
  // First do basic validation
  const basicValidation = validateImageFile(file, maxSizeMB);
  if (!basicValidation.isValid) {
    return Promise.resolve(basicValidation);
  }

  // Check image dimensions (optional)
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      // For logos, recommend square or landscape
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.5 || aspectRatio > 3) {
        resolve({
          isValid: false,
          error: 'Tỷ lệ khung hình không phù hợp. Khuyến nghị: 1:1 đến 3:1'
        });
      } else {
        resolve({ isValid: true });
      }
    };
    img.onerror = () => {
      resolve({
        isValid: false,
        error: 'Không thể đọc được file hình ảnh'
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

// Simple sync validation for banner
export const validateBannerFile = (file: File, maxSizeMB: number = 10): FileValidationResult => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Vui lòng chọn file hình ảnh (JPG, PNG, GIF, WebP)'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File quá lớn! Vui lòng chọn file nhỏ hơn ${maxSizeMB}MB`
    };
  }

  return { isValid: true };
};

// Async validation with dimension checking for banner
export const validateBannerFileWithDimensions = (file: File, maxSizeMB: number = 10): Promise<FileValidationResult> => {
  // First do basic validation
  const basicValidation = validateBannerFile(file, maxSizeMB);
  if (!basicValidation.isValid) {
    return Promise.resolve(basicValidation);
  }

  // For banners, recommend landscape format
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      if (aspectRatio < 1.5 || aspectRatio > 3) {
        resolve({
          isValid: false,
          error: 'Tỷ lệ khung hình không phù hợp cho banner. Khuyến nghị: 16:9 hoặc 2:1'
        });
      } else {
        resolve({ isValid: true });
      }
    };
    img.onerror = () => {
      resolve({
        isValid: false,
        error: 'Không thể đọc được file hình ảnh'
      });
    };
    img.src = URL.createObjectURL(file);
  });
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const allowedImageTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};