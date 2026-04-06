"use client";

import { useState, useCallback, useRef } from "react";
import { OrderItem, UploadedFile } from "@/lib/order-types";
import { Service } from "@/lib/service-api";
import {
  getFilePageCount,
  formatFileSize,
  isSupportedFileType,
  generateId,
  createFilePreviewUrl,
  revokeFilePreviewUrl,
} from "@/lib/file-utils";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Plus,
  Eye,
  Package,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FileUploadStepProps {
  orderItems: OrderItem[];
  onFileUploaded: (file: UploadedFile, selectedService?: Service) => void;
  onFileRemoved: (fileId: string) => void;
  onNext: () => void;
  canProceed: boolean;
  availableServices: Service[];
  selectedService: Service;
  onServiceChange: (service: Service) => void;
  onLoadAllServices?: () => Promise<void>;
}

export function FileUploadStep({
  orderItems,
  onFileUploaded,
  onFileRemoved,
  onNext,
  canProceed,
  availableServices,
  selectedService,
  onServiceChange,
  onLoadAllServices,
}: FileUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddDifferentService = async () => {
    // If already showing, just toggle off
    if (showServiceSelector) {
      setShowServiceSelector(false);
      return;
    }

    // If services not loaded yet, fetch them
    if (availableServices.length <= 1 && onLoadAllServices) {
      setIsLoadingServices(true);
      await onLoadAllServices();
      setIsLoadingServices(false);
    }
    setShowServiceSelector(true);
  };

  const processFile = useCallback(
    async (file: File) => {
      if (!isSupportedFileType(file)) {
        return;
      }

      const id = generateId();
      const previewUrl = createFilePreviewUrl(file);

      // Create initial file entry
      const uploadedFile: UploadedFile = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        pageCount: 0,
        previewUrl,
        uploadProgress: 0,
        status: "processing",
      };

      // Pass the currently selected service
      onFileUploaded(uploadedFile, selectedService);

      // Process page count (with conversion if needed)
      try {
        const { pageCount, pdfFile } = await getFilePageCount(file);

        // Update with page count
        uploadedFile.pageCount = pageCount;
        uploadedFile.status = "ready";
        uploadedFile.uploadProgress = 100;

        // If conversion happened, update the file and preview URL
        if (pdfFile) {
          // Revoke the original object URL to prevent memory leaks
          if (uploadedFile.previewUrl) {
            URL.revokeObjectURL(uploadedFile.previewUrl);
          }

          uploadedFile.originalFile = file; // Save original docx/image
          uploadedFile.file = pdfFile;
          uploadedFile.previewUrl = URL.createObjectURL(pdfFile);
          uploadedFile.type = pdfFile.type;
        }

        // Force re-render by removing and re-adding with selected service
        onFileRemoved(id);
        onFileUploaded({ ...uploadedFile }, selectedService);
      } catch (error) {
        uploadedFile.status = "error";
        uploadedFile.error =
          error instanceof Error ? error.message : "Failed to process file";
        onFileRemoved(id);
        onFileUploaded({ ...uploadedFile }, selectedService);
      }
    },
    [onFileUploaded, onFileRemoved, selectedService],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach(processFile);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFile],
  );

  const handleRemoveFile = useCallback(
    (file: UploadedFile) => {
      revokeFilePreviewUrl(file.previewUrl);
      onFileRemoved(file.id);
    },
    [onFileRemoved],
  );

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon;
    return FileText;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Upload Your Files
        </h2>
        <p className="text-muted-foreground">
          Upload the files you want to print. Word documents, images and text
          files will be automatically converted to PDF for accurate page
          counting.
        </p>
      </div>

      {/* Current Service Info */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between bg-card rounded-xl border border-border p-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Current Service</div>
            <div className="font-semibold text-foreground truncate">
              {selectedService.name}
            </div>
          </div>
        </div>

        {/* Show "Add Different Service" button only if files uploaded */}
        {orderItems.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddDifferentService}
            disabled={isLoadingServices}
            className="gap-2 w-full sm:w-auto justify-center"
          >
            {isLoadingServices ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading Services...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                {showServiceSelector
                  ? "Hide Services"
                  : "Add Different Service"}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Service Selector - Only show when user clicks "Add Different Service" */}
      {showServiceSelector && availableServices.length > 1 && (
        <div className="mb-6 bg-card rounded-xl border border-primary/50 p-6 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">
                Select Different Service
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose a service for your next file upload
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowServiceSelector(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableServices.map((service) => (
              <button
                key={service._id}
                onClick={() => {
                  onServiceChange(service);
                  setShowServiceSelector(false);
                }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  selectedService._id === service._id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card",
                )}
              >
                <div className="font-semibold text-foreground mb-1">
                  {service.name}
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {service.description || "Professional printing service"}
                </div>
                <div className="mt-2 text-xs font-medium text-primary">
                  From ₹{service.basePricePerPage}/page
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {isDragging ? "Drop files here" : "Drag & drop files here"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse from your device
          </p>
          <p className="text-xs text-muted-foreground">
            Supported: PDF, JPG, PNG, TXT, DOC, DOCX (Word docs & images
            auto-converted to PDF • Max 50MB per file)
          </p>
        </div>
      </div>

      {/* Uploaded Files List */}
      {orderItems.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Uploaded Files ({orderItems.length})
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add More
            </Button>
          </div>

          <div className="space-y-3">
            {orderItems.map((item) => {
              const FileIcon = getFileIcon(item.file.type);
              const isProcessing = item.file.status === "processing";
              const hasError = item.file.status === "error";
              const isReady = item.file.status === "ready";

              return (
                <div
                  key={item.file.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-card transition-colors relative",
                    hasError && "border-destructive/50 bg-destructive/5",
                    isReady && "border-border",
                  )}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* File Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                      hasError ? "bg-destructive/10" : "bg-primary/10",
                    )}
                  >
                    <FileIcon
                      className={cn(
                        "h-6 w-6",
                        hasError ? "text-destructive" : "text-primary",
                      )}
                    />
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground truncate">
                        {item.file.name}
                      </p>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
                        {item.serviceName}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm text-muted-foreground">
                      <span className="text-xs font-medium">{formatFileSize(item.file.size)}</span>
                      {isProcessing && (
                        <span className="flex items-center gap-1.5 text-primary text-xs bg-primary/5 py-1 px-2 rounded-md border border-primary/20">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Processing...
                        </span>
                      )}
                      {isReady && (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 text-green-600 font-bold text-[10px] sm:text-xs border border-green-200 uppercase tracking-tight">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {item.file.pageCount} {item.file.pageCount !== 1 ? "Pages" : "Page"} Detected
                          </span>
                        </div>
                      )}
                      {hasError && (
                        <span className="flex items-center gap-1.5 text-destructive text-xs bg-destructive/5 py-1 px-2 rounded-md border border-destructive/20">
                          <AlertCircle className="h-3 w-3" />
                          {item.file.error}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center self-end mt-2 sm:mt-0">
                    {isReady &&
                      (item.file.type.startsWith("image/") ||
                        item.file.type === "application/pdf") && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(item.file);
                          }}
                          className="h-8 gap-2 bg-primary/5 text-primary hover:bg-primary/10 border-transparent shadow-none"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sm:inline">Preview</span>
                        </Button>
                      )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(item.file);
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2"
        >
          Continue to Configure
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <div className="bg-card w-full rounded-lg overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold">
                    {previewFile.name} preview
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewFile(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-4 bg-muted/30">
                {previewFile.type.startsWith("image/") ? (
                  <div className="relative max-w-full max-h-[70vh] mx-auto">
                    <Image
                      src={previewFile.previewUrl}
                      alt={previewFile.name}
                      width={800}
                      height={600}
                      className="max-w-full max-h-[70vh] object-contain mx-auto rounded-md shadow-sm"
                      sizes="(max-width: 800px) 100vw, 800px"
                    />
                  </div>
                ) : (
                  <iframe
                    src={`${previewFile.previewUrl}#toolbar=0`}
                    className="w-full h-[70vh] rounded-md border border-border shadow-sm"
                    title={previewFile.name}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
