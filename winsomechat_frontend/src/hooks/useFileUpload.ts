import { useState } from "react";
import {
  uploadToPinata,
  uploadJSONToPinata,
  getPinataUrl,
} from "../lib/pinata";

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string> => {
    if (!file) {
      throw new Error("No file provided");
    }

    // Validate file type (images only)
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const ipfsHash = await uploadToPinata(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      return ipfsHash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadJSON = async (data: any): Promise<string> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 20, 90));
      }, 100);

      const ipfsHash = await uploadJSONToPinata(data);

      clearInterval(progressInterval);
      setUploadProgress(100);

      return ipfsHash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "JSON upload failed");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const getFileUrl = (ipfsHash: string): string => {
    return getPinataUrl(ipfsHash);
  };

  const reset = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setError(null);
  };

  return {
    uploadFile,
    uploadJSON,
    getFileUrl,
    isUploading,
    uploadProgress,
    error,
    reset,
  };
};
