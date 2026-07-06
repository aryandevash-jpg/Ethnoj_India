"use client";

import { Upload, X, Image as ImageIcon, Video, Link2, Sparkles, Film, Loader2, AlertCircle } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CloudinaryUploadProps {
  value: string;
  onChange: (url: string) => void;
  type?: "image" | "video" | "any";
  label?: string;
  placeholder?: string;
  aspectRatio?: "video" | "square" | "portrait";
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && CLOUD_NAME !== "your_cloud_name");
}

async function uploadToCloudinary(file: File, resourceType: string): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || "Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Upload timed out");
    }
    throw error;
  }
}

export function CloudinaryUpload({
  value,
  onChange,
  type = "image",
  label,
  placeholder = "Paste URL here...",
  aspectRatio = "video",
}: CloudinaryUploadProps) {
  const [isManualInput, setIsManualInput] = useState(!isCloudinaryConfigured());
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryEnabled = isCloudinaryConfigured();

  const resourceType = type === "video" ? "video" : "image";
  const acceptTypes = type === "video" 
    ? "video/mp4,video/webm,video/quicktime" 
    : type === "any" 
    ? "image/*,video/*" 
    : "image/jpeg,image/png,image/webp,image/gif";

  const isVideo = value?.includes(".mp4") || value?.includes(".webm") || value?.includes(".mov");

  const aspectClass = aspectRatio === "square" 
    ? "aspect-square" 
    : aspectRatio === "portrait" 
    ? "aspect-[3/4]" 
    : "aspect-video";

  const TypeIcon = type === "video" ? Film : ImageIcon;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    
    try {
      const url = await uploadToCloudinary(file, resourceType);
      onChange(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [onChange, resourceType]);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!cloudinaryEnabled) {
      setError("Cloudinary not configured. Please paste URL manually.");
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);
    
    try {
      const url = await uploadToCloudinary(file, resourceType);
      onChange(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  }, [cloudinaryEnabled, onChange, resourceType]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (cloudinaryEnabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        onChange={handleFileSelect}
        className="hidden"
        disabled={!cloudinaryEnabled}
      />

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group"
          >
            <div className={`relative ${aspectClass} w-full overflow-hidden rounded-xl border-2 border-gold/30 bg-cream shadow-warm`}>
              {isVideo || type === "video" ? (
                <>
                  <video
                    src={value}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    loop
                    autoPlay
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-maroon-deep/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="rounded-full bg-cream/90 p-3 shadow-lg">
                      <Video className="h-6 w-6 text-maroon" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={value}
                    alt="Preview"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
              
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-6 bg-gold/20 rotate-45 translate-x-6 -translate-y-2" />
              </div>
            </div>

            <motion.button
              type="button"
              onClick={() => onChange("")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -right-2 -top-2 z-10 rounded-full bg-maroon p-2 text-cream shadow-lg transition-colors hover:bg-maroon-deep"
            >
              <X className="h-4 w-4" />
            </motion.button>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-cream/95 px-3 py-1.5 text-xs font-medium text-maroon shadow-lg backdrop-blur-sm">
              <Sparkles className="h-3 w-3 text-gold" />
              Uploaded
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isManualInput && cloudinaryEnabled ? (
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading}
                whileHover={!isUploading ? { y: -2 } : undefined}
                whileTap={!isUploading ? { scale: 0.98 } : undefined}
                className={`
                  relative w-full overflow-hidden rounded-xl border-2 border-dashed 
                  transition-all duration-300 ${aspectClass}
                  ${isUploading ? "cursor-wait opacity-75" : "cursor-pointer"}
                  ${isDragging 
                    ? "border-gold bg-gold/10" 
                    : "border-maroon/30 bg-gradient-to-br from-cream to-cream-deep/50 hover:border-maroon hover:bg-cream"
                  }
                `}
              >
                <div className="absolute inset-0 bg-jali opacity-5" />
                
                <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6">
                  {isUploading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="rounded-full bg-maroon/10 p-4"
                      >
                        <Loader2 className="h-8 w-8 text-maroon" />
                      </motion.div>
                      <p className="font-medium text-maroon">Uploading...</p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        animate={{ 
                          y: isDragging ? -5 : 0,
                          scale: isDragging ? 1.1 : 1 
                        }}
                        className={`rounded-full p-4 transition-colors ${isDragging ? "bg-gold/20" : "bg-maroon/10"}`}
                      >
                        <TypeIcon className={`h-8 w-8 ${isDragging ? "text-gold" : "text-maroon"}`} />
                      </motion.div>
                      
                      <div className="text-center">
                        <p className="font-medium text-maroon">
                          {isDragging ? "Drop to upload" : `Upload ${type === "video" ? "Video" : type === "any" ? "Media" : "Image"}`}
                        </p>
                        <p className="mt-1 text-xs text-maroon/60">
                          Click to browse or drag and drop
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-maroon/50">
                        <span className="flex items-center gap-1">
                          <Upload className="h-3 w-3" /> Browse files
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="absolute top-3 left-3 h-6 w-6 border-l-2 border-t-2 border-gold/30 rounded-tl-lg" />
                <div className="absolute bottom-3 right-3 h-6 w-6 border-r-2 border-b-2 border-gold/30 rounded-br-lg" />
              </motion.button>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="url"
                    value={value}
                    onChange={(e) => {
                      setError(null);
                      onChange(e.target.value);
                    }}
                    placeholder={placeholder}
                    className="w-full rounded-xl border-2 border-maroon/20 bg-cream px-4 py-3 pl-10 text-sm text-maroon placeholder:text-maroon/40 focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon/10"
                  />
                  <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-maroon/40" />
                </div>
                {!cloudinaryEnabled && (
                  <p className="text-xs text-amber-600">
                    Cloudinary not configured. Paste media URL directly.
                  </p>
                )}
              </div>
            )}

            {cloudinaryEnabled && (
              <button
                type="button"
                onClick={() => setIsManualInput(!isManualInput)}
                className="flex items-center gap-2 text-xs text-maroon/60 transition-colors hover:text-maroon"
              >
                {isManualInput ? (
                  <>
                    <Upload className="h-3 w-3" />
                    Use file picker instead
                  </>
                ) : (
                  <>
                    <Link2 className="h-3 w-3" />
                    Or paste URL manually
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CloudinaryMultiUpload({
  values,
  onChange,
  type = "image",
  label,
  maxFiles = 5,
}: {
  values: string[];
  onChange: (urls: string[]) => void;
  type?: "image" | "video" | "any";
  label?: string;
  maxFiles?: number;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudinaryEnabled = isCloudinaryConfigured();
  const resourceType = type === "video" ? "video" : "image";
  const acceptTypes = type === "video" 
    ? "video/mp4,video/webm,video/quicktime" 
    : type === "any" 
    ? "image/*,video/*" 
    : "image/jpeg,image/png,image/webp,image/gif";

  const removeImage = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (!cloudinaryEnabled) {
      setError("Cloudinary not configured");
      return;
    }

    setError(null);
    setIsUploading(true);
    
    try {
      const uploadPromises = files.slice(0, maxFiles - values.length).map(file => 
        uploadToCloudinary(file, resourceType)
      );
      const urls = await Promise.all(uploadPromises);
      onChange([...values, ...urls]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptTypes}
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={!cloudinaryEnabled}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        <AnimatePresence>
          {values.map((url, index) => (
            <motion.div 
              key={url}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square"
            >
              <div className="h-full w-full overflow-hidden rounded-xl border-2 border-gold/20 bg-cream shadow-warm">
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <motion.button
                type="button"
                onClick={() => removeImage(index)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -right-2 -top-2 z-10 rounded-full bg-maroon p-1.5 text-cream shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-maroon-deep"
              >
                <X className="h-3 w-3" />
              </motion.button>

              <div className="absolute bottom-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-cream/90 text-xs font-medium text-maroon shadow">
                {index + 1}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {values.length < maxFiles && (
          cloudinaryEnabled ? (
            <motion.button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-maroon/30 bg-gradient-to-br from-cream to-cream-deep/50 transition-all hover:border-maroon hover:bg-cream disabled:cursor-wait disabled:opacity-75"
            >
              <div className="absolute inset-0 bg-jali opacity-5" />
              <div className="relative text-center">
                {isUploading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mx-auto"
                  >
                    <Loader2 className="h-6 w-6 text-maroon" />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      className="mx-auto mb-2 rounded-full bg-maroon/10 p-3"
                      whileHover={{ rotate: 90 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ImageIcon className="h-5 w-5 text-maroon" />
                    </motion.div>
                    <span className="text-xs font-medium text-maroon">Add More</span>
                    <p className="mt-0.5 text-[10px] text-maroon/50">
                      {values.length}/{maxFiles}
                    </p>
                  </>
                )}
              </div>

              <div className="absolute top-2 left-2 h-4 w-4 border-l-2 border-t-2 border-gold/30 rounded-tl" />
              <div className="absolute bottom-2 right-2 h-4 w-4 border-r-2 border-b-2 border-gold/30 rounded-br" />
            </motion.button>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center text-xs text-gray-500">
              Cloudinary not configured
            </div>
          )
        )}
      </div>

      {values.length > 0 && (
        <p className="text-xs text-maroon/50">
          {values.length} of {maxFiles} images uploaded
        </p>
      )}
    </div>
  );
}
