// File Path: web/frontend/src/constants/FileUpload.js

// File size limits
export const MAX_AVATAR_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_AVATAR_FILE_SIZE_MB = 10;

// Allowed file types for avatar/image uploads
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

export const ALLOWED_IMAGE_EXTENSIONS = ["JPEG", "JPG", "PNG", "GIF"];

// File upload error messages
export const FILE_UPLOAD_ERRORS = {
  INVALID_TYPE: `Invalid file type. Please upload a ${ALLOWED_IMAGE_EXTENSIONS.join(", ")} image.`,
  FILE_TOO_LARGE: `File is too large. The maximum size is ${MAX_AVATAR_FILE_SIZE_MB} MB.`,
  NO_FILE_SELECTED: "Please select a file to upload",
};

// File size conversion constants
export const BYTES_PER_KB = 1024;
export const BYTES_PER_MB = 1024 * 1024;
