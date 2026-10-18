import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Minus,
  Plus,
  BookOpen,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import { ToolOptionField } from '../../types/tools';
import { useApp } from '../../context/AppContext';

export interface SplitRangeSelectorProps {
  totalPages: number;
  fromPage: number;
  toPage: number;
  onRangeChange: (from: number, to: number) => void;
  validationError?: string;
}

/**
 * Dedicated Split PDF Page-Range Selector:
 * Displays:
 *   من صفحة [−] [1] [+]
 *   إلى صفحة [−] [5] [+]
 * Enforces bounds [1..totalPages] and guarantees fromPage <= toPage.
 */
export const SplitRangeSelector: React.FC<SplitRangeSelectorProps> = ({
  totalPages,
  fromPage,
  toPage,
  onRangeChange,
  validationError,
}) => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const [fromInput, setFromInput] = useState<string>(String(fromPage));
  const [toInput, setToInput] = useState<string>(String(toPage));
  const [localError, setLocalError] = useState<string>('');

  const safeTotal = Math.max(1, totalPages);

  useEffect(() => {
    setFromInput(String(fromPage));
  }, [fromPage]);

  useEffect(() => {
    setToInput(String(toPage));
  }, [toPage]);

  const applyValidatedRange = (nextFrom: number, nextTo: number) => {
    const clampedFrom = Math.max(1, Math.min(safeTotal, Math.round(nextFrom)));
    const clampedTo = Math.max(1, Math.min(safeTotal, Math.round(nextTo)));

    if (clampedFrom > clampedTo) {
      // Predictably adjust the other bound so start page never exceeds end page
      setLocalError('');
      onRangeChange(clampedFrom, clampedFrom);
      return;
    }

    setLocalError('');
    onRangeChange(clampedFrom, clampedTo);
  };

  const handleFromStep = (delta: number) => {
    const nextFrom = Math.max(1, Math.min(safeTotal, fromPage + delta));
    const nextTo = Math.max(nextFrom, toPage);
    setLocalError('');
    onRangeChange(nextFrom, nextTo);
  };

  const handleToStep = (delta: number) => {
    const nextTo = Math.max(1, Math.min(safeTotal, toPage + delta));
    const nextFrom = Math.min(fromPage, nextTo);
    setLocalError('');
    onRangeChange(nextFrom, nextTo);
  };

  const handleFromInputChange = (raw: string) => {
    setFromInput(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setLocalError('يرجى إدخال رقم صفحة البداية.');
      return;
    }
    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1 || num > safeTotal) {
      setLocalError(`رقم صفحة البداية يجب أن يكون بين 1 و ${safeTotal}.`);
      return;
    }
    if (num > toPage) {
      setLocalError('');
      onRangeChange(num, num);
      return;
    }
    setLocalError('');
    onRangeChange(num, toPage);
  };

  const handleToInputChange = (raw: string) => {
    setToInput(raw);
    const trimmed = raw.trim();
    if (!trimmed) {
      setLocalError('يرجى إدخال رقم صفحة النهاية.');
      return;
    }
    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1 || num > safeTotal) {
      setLocalError(`رقم صفحة النهاية يجب أن يكون بين 1 و ${safeTotal}.`);
      return;
    }
    if (num < fromPage) {
      setLocalError('رقم صفحة النهاية لا يمكن أن يكون أصغر من صفحة البداية.');
      return;
    }
    setLocalError('');
    onRangeChange(fromPage, num);
  };

  const handleFromBlur = () => {
    const num = Number(fromInput);
    if (!Number.isInteger(num) || num < 1) {
      applyValidatedRange(1, toPage);
      setFromInput('1');
    } else if (num > safeTotal) {
      applyValidatedRange(safeTotal, safeTotal);
      setFromInput(String(safeTotal));
    } else if (num > toPage) {
      applyValidatedRange(num, num);
    } else {
      setLocalError('');
    }
  };

  const handleToBlur = () => {
    const num = Number(toInput);
    if (!Number.isInteger(num) || num < fromPage) {
      applyValidatedRange(fromPage, fromPage);
      setToInput(String(fromPage));
    } else if (num > safeTotal) {
      applyValidatedRange(fromPage, safeTotal);
      setToInput(String(safeTotal));
    } else {
      setLocalError('');
    }
  };

  const selectedCount = Math.max(1, toPage - fromPage + 1);
  const activeError = validationError || localError;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 space-y-5 transition-colors ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-[#F5F9FF]/90 border-[#DCE7F5]'
      }`}
    >
      {/* Header & Page Count Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3.5 border-[#DCE7F5] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h4
              className={`text-sm font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              تحديد نطاق الصفحات للاستخراج
            </h4>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-[#DCE7F5] dark:border-slate-700 text-xs font-extrabold text-[#1769FF] dark:text-[#38A5FF] shadow-2xs tabular-nums">
          <span>عدد صفحات الملف: {safeTotal} صفحة</span>
        </div>
      </div>

      {/* Two Clear Numeric Stepper Controls: من صفحة & إلى صفحة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {/* من صفحة */}
        <div
          className={`rounded-xl border p-4 space-y-3 ${
            isDark
              ? 'bg-slate-950/70 border-slate-800'
              : 'bg-white border-[#DCE7F5] shadow-[0_2px_10px_rgba(23,105,255,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="split-from-page-input"
              className={`text-sm font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              من صفحة
            </label>
            <span className="text-[11px] font-semibold text-[#687A96] tabular-nums">
              الحد الأدنى: 1
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleFromStep(-1)}
              disabled={fromPage <= 1}
              aria-label="إنقاص رقم صفحة البداية بمقدار 1"
              title="الصفحة السابقة (−)"
              className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 enabled:hover:border-[#38A5FF]'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] enabled:hover:bg-[#EAF3FF] enabled:hover:border-[#1769FF] enabled:hover:text-[#1769FF]'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              id="split-from-page-input"
              type="number"
              inputMode="numeric"
              min={1}
              max={safeTotal}
              value={fromInput}
              onChange={(e) => handleFromInputChange(e.target.value)}
              onBlur={handleFromBlur}
              aria-label="من صفحة"
              className={`w-full h-11 rounded-xl text-center text-base font-extrabold tabular-nums border transition-all focus:outline-none focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/15 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-[#DCE7F5] text-[#172B4D]'
              }`}
            />

            <button
              type="button"
              onClick={() => handleFromStep(1)}
              disabled={fromPage >= safeTotal}
              aria-label="زيادة رقم صفحة البداية بمقدار 1"
              title="الصفحة التالية (+)"
              className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 enabled:hover:border-[#38A5FF]'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] enabled:hover:bg-[#EAF3FF] enabled:hover:border-[#1769FF] enabled:hover:text-[#1769FF]'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* إلى صفحة */}
        <div
          className={`rounded-xl border p-4 space-y-3 ${
            isDark
              ? 'bg-slate-950/70 border-slate-800'
              : 'bg-white border-[#DCE7F5] shadow-[0_2px_10px_rgba(23,105,255,0.03)]'
          }`}
        >
          <div className="flex items-center justify-between">
            <label
              htmlFor="split-to-page-input"
              className={`text-sm font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              إلى صفحة
            </label>
            <span className="text-[11px] font-semibold text-[#687A96] tabular-nums">
              الحد الأقصى: {safeTotal}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => handleToStep(-1)}
              disabled={toPage <= fromPage || toPage <= 1}
              aria-label="إنقاص رقم صفحة النهاية بمقدار 1"
              title="الصفحة السابقة (−)"
              className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 enabled:hover:border-[#38A5FF]'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] enabled:hover:bg-[#EAF3FF] enabled:hover:border-[#1769FF] enabled:hover:text-[#1769FF]'
              }`}
            >
              <Minus className="w-4 h-4" />
            </button>

            <input
              id="split-to-page-input"
              type="number"
              inputMode="numeric"
              min={fromPage}
              max={safeTotal}
              value={toInput}
              onChange={(e) => handleToInputChange(e.target.value)}
              onBlur={handleToBlur}
              aria-label="إلى صفحة"
              className={`w-full h-11 rounded-xl text-center text-base font-extrabold tabular-nums border transition-all focus:outline-none focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/15 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white'
                  : 'bg-white border-[#DCE7F5] text-[#172B4D]'
              }`}
            />

            <button
              type="button"
              onClick={() => handleToStep(1)}
              disabled={toPage >= safeTotal}
              aria-label="زيادة رقم صفحة النهاية بمقدار 1"
              title="الصفحة التالية (+)"
              className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold transition-all cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 enabled:hover:border-[#38A5FF]'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D] enabled:hover:bg-[#EAF3FF] enabled:hover:border-[#1769FF] enabled:hover:text-[#1769FF]'
              }`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Required Arabic Explanation & Live Selection Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
        <p className="font-semibold text-[#172B4D] dark:text-slate-300">
          سيتم استخراج الصفحات من الرقم الأول إلى الرقم الثاني في ملف PDF جديد.
        </p>
        <span className="font-bold text-[#1769FF] dark:text-[#38A5FF] tabular-nums">
          النطاق المحدد: من صفحة {fromPage} إلى صفحة {toPage} ({selectedCount}{' '}
          {selectedCount === 1 ? 'صفحة' : 'صفحات'})
        </span>
      </div>

      {activeError && (
        <div
          role="alert"
          className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 px-3.5 py-2.5 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{activeError}</span>
        </div>
      )}
    </div>
  );
};

interface ToolOptionsPanelProps {
  schema?: ToolOptionField[];
  values: Record<string, string | number | boolean>;
  onChange: (id: string, value: string | number | boolean) => void;
  fieldErrors?: Record<string, string>;
  extraTopSlot?: React.ReactNode;
}

export const ToolOptionsPanel: React.FC<ToolOptionsPanelProps> = ({
  schema = [],
  values,
  onChange,
  fieldErrors = {},
  extraTopSlot,
}) => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  if (schema.length === 0 && !extraTopSlot) return null;

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 space-y-5 ${
        isDark
          ? 'bg-slate-900 border-slate-800'
          : 'bg-white border-[#DCE7F5] shadow-[0_4px_20px_rgba(23,105,255,0.04)]'
      }`}
    >
      <div className="flex items-center justify-between border-b pb-3.5 border-[#DCE7F5] dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-[#1769FF] dark:text-[#38A5FF] flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3
              className={`text-sm sm:text-base font-extrabold ${
                isDark ? 'text-white' : 'text-[#172B4D]'
              }`}
            >
              إعدادات وخيارات المعالجة
            </h3>
          </div>
        </div>
      </div>

      {extraTopSlot}

      {schema.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {schema.map((field) => {
            const val = values[field.id] ?? field.defaultValue;
            const fieldError = fieldErrors[field.id];

            return (
              <div
                key={field.id}
                className={`rounded-xl border p-4 space-y-2.5 transition-colors ${
                  fieldError
                    ? 'border-rose-400 bg-rose-50/30 dark:border-rose-700 dark:bg-rose-950/20'
                    : isDark
                    ? 'bg-slate-950/50 border-slate-800/90'
                    : 'bg-[#F5F9FF]/70 border-[#DCE7F5]/90'
                }`}
              >
                {field.type !== 'checkbox' && (
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`opt-${field.id}`}
                      className={`text-xs sm:text-sm font-bold ${
                        isDark ? 'text-slate-100' : 'text-[#172B4D]'
                      }`}
                    >
                      {field.label}
                    </label>
                    {field.type === 'range' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EAF3FF] dark:bg-[#1769FF]/20 text-xs font-extrabold text-[#1769FF] dark:text-[#38A5FF] tabular-nums">
                        {String(val)}
                        {field.unit || ''}
                      </span>
                    )}
                  </div>
                )}

                {field.type === 'select' && field.options && (
                  <div className="relative">
                    <select
                      id={`opt-${field.id}`}
                      value={String(val)}
                      onChange={(e) => onChange(field.id, e.target.value)}
                      className={`w-full appearance-none rounded-xl pr-3.5 pl-9 py-2.5 text-sm font-semibold border transition-all cursor-pointer focus:outline-none focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/15 ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-[#DCE7F5] text-[#172B4D]'
                      }`}
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      className="w-4 h-4 text-[#687A96] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {field.type === 'range' && (
                  <div className="pt-1">
                    <input
                      id={`opt-${field.id}`}
                      type="range"
                      min={field.min ?? 0}
                      max={field.max ?? 100}
                      step={field.step ?? 1}
                      value={Number(val)}
                      onChange={(e) => onChange(field.id, Number(e.target.value))}
                      className="w-full accent-[#1769FF] cursor-pointer"
                    />
                    {field.min !== undefined && field.max !== undefined && (
                      <div className="flex items-center justify-between text-[11px] text-[#687A96] tabular-nums mt-1">
                        <span>
                          {field.min}
                          {field.unit || ''}
                        </span>
                        <span>
                          {field.max}
                          {field.unit || ''}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {field.type === 'number' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        field.min !== undefined && Number(val) <= field.min
                      }
                      onClick={() => {
                        const step = field.step ?? 1;
                        const next = Number(val) - step;
                        onChange(
                          field.id,
                          field.min !== undefined
                            ? Math.max(field.min, next)
                            : next
                        );
                      }}
                      aria-label={`إنقاص ${field.label}`}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                          : 'bg-white border-[#DCE7F5] text-[#172B4D] hover:bg-[#EAF3FF] hover:border-[#1769FF]'
                      }`}
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <input
                      id={`opt-${field.id}`}
                      type="number"
                      min={field.min}
                      max={field.max}
                      step={field.step ?? 1}
                      value={Number(val)}
                      onChange={(e) => onChange(field.id, Number(e.target.value))}
                      className={`w-full h-10 rounded-xl px-3.5 text-center text-sm font-bold border tabular-nums transition-all focus:outline-none focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/15 ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white'
                          : 'bg-white border-[#DCE7F5] text-[#172B4D]'
                      }`}
                    />

                    <button
                      type="button"
                      disabled={
                        field.max !== undefined && Number(val) >= field.max
                      }
                      onClick={() => {
                        const step = field.step ?? 1;
                        const next = Number(val) + step;
                        onChange(
                          field.id,
                          field.max !== undefined
                            ? Math.min(field.max, next)
                            : next
                        );
                      }}
                      aria-label={`زيادة ${field.label}`}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white hover:bg-slate-800'
                          : 'bg-white border-[#DCE7F5] text-[#172B4D] hover:bg-[#EAF3FF] hover:border-[#1769FF]'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {(field.type === 'text' || field.type === 'password') && (
                  <input
                    id={`opt-${field.id}`}
                    type={field.type === 'password' ? 'password' : 'text'}
                    value={String(val)}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    placeholder={
                      field.type === 'password' ? '••••••••' : undefined
                    }
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-medium border transition-all focus:outline-none focus:border-[#1769FF] focus:ring-3 focus:ring-[#1769FF]/15 ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-white border-[#DCE7F5] text-[#172B4D]'
                    }`}
                  />
                )}

                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 py-1 cursor-pointer select-none">
                    <span
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        Boolean(val)
                          ? 'bg-[#1769FF] border-[#1769FF] text-white'
                          : isDark
                          ? 'bg-slate-900 border-slate-700'
                          : 'bg-white border-[#DCE7F5]'
                      }`}
                    >
                      {Boolean(val) && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <input
                      type="checkbox"
                      checked={Boolean(val)}
                      onChange={(e) => onChange(field.id, e.target.checked)}
                      className="sr-only"
                    />
                    <span
                      className={`text-sm font-bold ${
                        isDark ? 'text-slate-100' : 'text-[#172B4D]'
                      }`}
                    >
                      {field.label}
                    </span>
                  </label>
                )}

                {field.helperText && !fieldError && (
                  <p className="text-xs text-[#687A96] leading-relaxed">
                    {field.helperText}
                  </p>
                )}

                {fieldError && (
                  <p
                    role="alert"
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldError}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
