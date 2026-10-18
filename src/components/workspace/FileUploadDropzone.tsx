import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  File as FileIcon,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FileUploadDropzoneProps {
  files: File[];
  onFilesChange: (newFiles: File[]) => void;
  acceptedFormats?: string[];
  acceptMime?: string;
  multiple?: boolean;
  allowReorder?: boolean;
  fileMetaBadges?: Record<string, string>;
  onValidationError?: (msg: string) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  const k = 1024;
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({
  files,
  onFilesChange,
  acceptedFormats = [],
  acceptMime = '*/*',
  multiple = false,
  allowReorder = false,
  fileMetaBadges = {},
  onValidationError,
}) => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndAddFiles = (incomingList: FileList | null) => {
    if (!incomingList || incomingList.length === 0) return;
    const incoming = Array.from(incomingList);

    const zeroByteFile = incoming.find((f) => f.size === 0);
    if (zeroByteFile) {
      onValidationError?.(
        `الملف "${zeroByteFile.name}" فارغ (0 بايت) ولا يمكن معالجته.`
      );
      return;
    }

    if (acceptedFormats.length > 0) {
      const invalidFile = incoming.find((file) => {
        const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
        return !acceptedFormats.some((fmt) => fmt.toLowerCase() === ext);
      });

      if (invalidFile) {
        onValidationError?.(
          `الملف "${invalidFile.name}" غير مدعوم في هذه الأداة. الصيغ المدعومة هي: ${acceptedFormats.join(' ، ')}`
        );
        return;
      }
    }

    if (multiple) {
      onFilesChange([...files, ...incoming]);
    } else {
      onFilesChange([incoming[0]]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndAddFiles(e.dataTransfer.files);
  };

  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const removeFile = (index: number) => {
    setConfirmClearAll(false);
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onFilesChange(updated);
  };

  const handleClearAllClick = () => {
    if (settings.confirmBeforeClear && files.length > 1 && !confirmClearAll) {
      setConfirmClearAll(true);
      setTimeout(() => setConfirmClearAll(false), 3500);
      return;
    }
    setConfirmClearAll(false);
    onFilesChange([]);
  };

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept={acceptMime}
        multiple={multiple}
        onChange={(e) => {
          validateAndAddFiles(e.target.files);
          e.target.value = '';
        }}
        className="hidden"
        aria-label="اختيار الملفات من الجهاز"
      />

      {files.length === 0 ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
            isDragging
              ? 'border-[#1769FF] bg-[#EAF3FF] scale-[0.99]'
              : isDark
              ? 'border-slate-700 hover:border-[#38A5FF] bg-slate-900/60'
              : 'border-[#DCE7F5] hover:border-[#38A5FF] bg-white shadow-[0_4px_20px_rgba(23,105,255,0.04)]'
          }`}
        >
          <div className="w-16 h-16 rounded-2xl bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center mx-auto mb-4">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3
            className={`text-lg sm:text-xl font-bold mb-2 ${
              isDark ? 'text-white' : 'text-[#172B4D]'
            }`}
          >
            {multiple
              ? 'اسحب وأفلت الملفات هنا، أو اضغط للاختيار'
              : 'اسحب وأفلت الملف هنا، أو اضغط للاختيار'}
          </h3>

          <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-[#687A96]'}`}>
            {acceptedFormats.length > 0
              ? `الصيغ المدعومة: ${acceptedFormats.join(' ، ').toUpperCase()}`
              : 'جميع الملفات القياسية مدعومة'}
          </p>

          <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] text-white font-bold text-sm shadow-sm transition-colors">
            <Plus className="w-4 h-4" />
            <span>{multiple ? 'اختيار الملفات' : 'اختيار ملف من جهازك'}</span>
          </span>
        </div>
      ) : (
        <div
          className={`rounded-2xl border p-5 space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold">
              <span>الملفات المحددة ({files.length})</span>
              {allowReorder && files.length > 1 && (
                <span className="text-xs font-normal text-[#687A96]">
                  (يمكنك إعادة ترتيب الملفات بالأسهم قبل الدمج)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {multiple && (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EAF3FF] text-[#1769FF] hover:bg-[#DCE7F5] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة ملف آخر</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAllClick}
                className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  confirmClearAll
                    ? 'bg-rose-600 text-white'
                    : 'text-rose-500 hover:bg-rose-500/10'
                }`}
              >
                {confirmClearAll ? 'تأكيد إزالة الكل؟' : 'إزالة الكل'}
              </button>
            </div>
          </div>

          <ul className="divide-y divide-[#DCE7F5]/60 dark:divide-slate-800">
            {files.map((file, idx) => {
              const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
              const badge = fileMetaBadges[fileKey];
              return (
                <li
                  key={`${fileKey}-${idx}`}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] text-xs font-extrabold flex items-center justify-center shrink-0 tabular-nums">
                      {idx + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] dark:bg-slate-800 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center shrink-0">
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          isDark ? 'text-slate-100' : 'text-[#172B4D]'
                        }`}
                      >
                        {file.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#687A96] tabular-nums">
                        <span>{formatFileSize(file.size)}</span>
                        {badge && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-bold text-[#1769FF] dark:text-[#38A5FF]">
                              {badge}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {allowReorder && files.length > 1 && (
                      <>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveFile(idx, 'up')}
                          aria-label={`تحريك ${file.name} لأعلى`}
                          title="تحريك لأعلى"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            isDark
                              ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                              : 'border-[#DCE7F5] text-[#172B4D] hover:bg-[#EAF3FF]'
                          }`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === files.length - 1}
                          onClick={() => moveFile(idx, 'down')}
                          aria-label={`تحريك ${file.name} لأسفل`}
                          title="تحريك لأسفل"
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            isDark
                              ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                              : 'border-[#DCE7F5] text-[#172B4D] hover:bg-[#EAF3FF]'
                          }`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      aria-label={`حذف ${file.name}`}
                      title="إزالة الملف"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
