// src/components/file-upload.tsx
"use client";

import { Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadPDF } from "@/services/api";
import { toast } from "@/components/ui/toast";

export default function FileUploadComponent() {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        await uploadPDF(file);
        toast.add({
          type: "success",
          title: "Success",
          description: "PDF uploaded and processing started!",
        });
      } catch (err: any) {
        toast.add({
          type: "error",
          title: "Upload failed",
          description: err.message,
        });
      } finally {
        setIsUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="bg-card rounded-xl shadow-md p-8 border border-border">
      <div
        onClick={handleFileUpload}
        className="flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors rounded-lg p-6 border-2 border-dashed border-border"
      >
        {isUploading ? (
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        ) : (
          <Upload className="w-12 h-12 text-muted-foreground" />
        )}
        <h3 className="text-lg font-medium text-foreground">
          {isUploading ? "Uploading..." : "Upload PDF file"}
        </h3>
        <p className="text-sm text-muted-foreground">Click to select a PDF</p>
      </div>
    </div>
  );
}
