import { useRef, useState, useCallback } from "react";

interface UseImageUploadProps {
  initialUrl?: string | { data: string; name: string } | null;
  onUpload: (value: { data: string; name: string } | string | null) => void;
}

export function useImageUpload({ initialUrl, onUpload }: UseImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof initialUrl === 'object' && initialUrl !== null ? initialUrl.data : (initialUrl as string | null) || null
  );
  const [fileName, setFileName] = useState<string>(
    typeof initialUrl === 'object' && initialUrl !== null ? initialUrl.name : ""
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewUrl(result);
        onUpload({ data: result, name: file.name });
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const handleRemove = useCallback(() => {
    setPreviewUrl(null);
    setFileName("");
    onUpload(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [onUpload]);

  return {
    previewUrl,
    fileName,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}