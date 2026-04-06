"use client";

import { ImagePlus, X, Upload, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";
import { useImageUpload } from "../../hooks/use-image-upload";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: string | { data: string; name: string } | null;
  onChange: (value: { data: string; name: string } | string | null) => void;
  label?: string;
  className?: string;
  recommendation?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  objectFit?: "cover" | "contain";
}

export function ImageUpload({
  value,
  onChange,
  label,
  className = "",
  recommendation = "PNG, JPG (Max 5MB)",
  aspectRatio = "video",
  objectFit = "cover",
}: ImageUploadProps) {
  const {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    initialUrl: value,
    onUpload: onChange,
  });

  const [isDragging, setIsDragging] = useState(false);

  const aspectClasses = {
    square: "aspect-square w-full max-w-32",
    video: "aspect-video w-full",
    wide: "aspect-[8/3] w-full max-w-64",
    auto: "w-full h-auto min-h-[160px]",
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange],
  );

  const displayUrl =
    previewUrl || (typeof value === "object" ? value?.data : value);
  const hasValidImage =
    displayUrl && typeof displayUrl === "string" && displayUrl.trim() !== "";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <Input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <div className="flex flex-col gap-4">
        {/* Image Preview/Upload Area */}
        <div className="w-full">
          {!hasValidImage ? (
            <div
              onClick={handleThumbnailClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                `${aspectClasses[aspectRatio]} cursor-pointer flex flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-muted-foreground/20 bg-muted/5 transition-all duration-300 hover:bg-primary/3 hover:border-primary/40 active:scale-95 group min-h-[120px]`,
                isDragging &&
                  "border-primary bg-primary/5 scale-105 shadow-xl shadow-primary/10",
              )}
            >
              <div className="flex flex-col items-center gap-3 p-4 transition-transform group-hover:scale-110">
                <div className="rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 p-3 shadow-inner border border-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                  <ImagePlus className="h-6 w-6 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground tracking-wide">
                    Add Photo
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    Click or Drop
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative group w-full">
              <div
                className={`${aspectClasses[aspectRatio]} overflow-hidden rounded-[1.5rem] border bg-muted shadow-inner min-h-[120px]`}
              >
                <Image
                  src={displayUrl}
                  alt="Preview"
                  fill
                  className={cn(
                    "transition-transform duration-500 group-hover:scale-105",
                    objectFit === "cover"
                      ? "object-cover"
                      : "object-contain p-4",
                  )}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 512px, 320px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200" />
                <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleThumbnailClick}
                    className="h-8 w-8 p-0 bg-background/90 hover:bg-background rounded-full"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    className="h-8 w-8 p-0 bg-destructive/90 hover:bg-destructive rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Info & Guidelines */}
      <div className="flex flex-col gap-2 px-1">
        {fileName && (
          <div className="flex items-center gap-2 py-2 px-3 bg-primary/5 rounded-xl border border-primary/10 w-full">
            <span className="text-xs font-bold text-primary truncate flex-1">
              {fileName}
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-full p-1 hover:bg-primary/10 transition-colors shrink-0"
            >
              <X className="h-3 w-3 text-primary" />
            </button>
          </div>
        )}
        <div className="text-xs text-muted-foreground/70 font-medium text-center space-y-1">
          {recommendation && <div>{recommendation}</div>}
        </div>
      </div>
    </div>
  );
}
