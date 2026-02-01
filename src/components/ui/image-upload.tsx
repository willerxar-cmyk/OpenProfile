'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/I18nContext';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  folder?: 'projects' | 'blog' | 'curriculum' | 'avatar' | 'general';
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'auto';
  maxSize?: number;
  acceptedTypes?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  folder = 'general',
  className,
  aspectRatio = 'auto',
  maxSize = 5 * 1024 * 1024,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif'],
  placeholder,
  disabled = false,
}: ImageUploadProps) {
  const { t } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    auto: '',
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return t('upload.invalidType') || 'Tipo de arquivo inválido';
    }
    if (file.size > maxSize) {
      return t('upload.fileTooLarge') || 'Arquivo muito grande (máx 5MB)';
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      await uploadFile(file);
    },
    [folder, maxSize, acceptedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        handleFile(file);
      }
    },
    [handleFile, disabled, isUploading]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = async () => {
    if (value && value.startsWith('/uploads/')) {
      try {
        const parts = value.split('/');
        const filename = parts[parts.length - 1];
        const uploadFolder = parts[parts.length - 2];

        await fetch(`/api/upload?filename=${filename}&folder=${uploadFolder}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Failed to delete file:', err);
      }
    }
    onChange(null);
    setError(null);
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  if (value) {
    return (
      <div className={cn('relative group', className)}>
        <div
          className={cn(
            'relative overflow-hidden rounded-lg border-2 border-border bg-muted',
            aspectRatioClasses[aspectRatio]
          )}
        >
          <img
            src={value}
            alt={t('upload.preview') || 'Preview'}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleClick}
              disabled={disabled || isUploading}
              className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-gray-900" />
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="p-2 bg-white rounded-full hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative cursor-pointer transition-all duration-200',
          'border-2 border-dashed rounded-lg p-8',
          'flex flex-col items-center justify-center gap-3',
          'hover:border-primary/50 hover:bg-primary/5',
          aspectRatioClasses[aspectRatio],
          isDragging && 'border-primary bg-primary/10 scale-[1.02]',
          error && 'border-destructive bg-destructive/5',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'opacity-70 cursor-wait'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('upload.uploading') || 'Enviando...'}
            </p>
          </>
        ) : (
          <>
            <div className="p-3 rounded-full bg-primary/10">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {placeholder || t('upload.dragDrop') || 'Arraste uma imagem ou clique para selecionar'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('upload.supportedFormats') || 'JPEG, PNG, WebP, GIF, AVIF, SVG (máx 5MB)'}
              </p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <X className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  );
}
