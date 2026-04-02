"use client";

import Image from "next/image";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/Button";

type ImageUploadFieldProps = {
  label: string;
  hint: string;
  previewUrl?: string | null;
  isUploading?: boolean;
  inputId: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
};

export function ImageUploadField({
  label,
  hint,
  previewUrl,
  isUploading = false,
  inputId,
  onFileSelect,
  onRemove,
}: ImageUploadFieldProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {previewUrl && (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            onClick={onRemove}
          >
            <Trash2 size={16} />
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-900/60">
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative h-52 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
              <Image src={previewUrl} alt={label} fill className="object-contain" unoptimized />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-800"
              >
                <UploadCloud size={16} />
                تبديل الصورة
              </label>
            </div>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center transition hover:border-primary hover:bg-primary/5 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-primary dark:hover:bg-primary/10"
          >
            {isUploading ? (
              <Loader2 size={26} className="animate-spin text-primary" />
            ) : (
              <ImagePlus size={26} className="text-primary" />
            )}
            <div className="space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {isUploading ? "جاري رفع الصورة..." : label}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
            </div>
          </label>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onFileSelect(file);
            }
            event.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
