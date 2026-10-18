import React, { useState } from 'react';
import {
  Calculator,
  CheckCircle2,
  Info,
  RotateCcw,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ZakatCalculatorWorkspace: React.FC = () => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const [currency, setCurrency] = useState('ر.س');
  const [goldPricePerGram24, setGoldPricePerGram24] = useState<number>(315);
  const [cashAndBank, setCashAndBank] = useState<number>(45000);
  const [gold24Grams, setGold24Grams] = useState<number>(0);
  const [gold21Grams, setGold21Grams] = useState<number>(0);
  const [gold18Grams, setGold18Grams] = useState<number>(0);
  const [tradeGoodsValue, setTradeGoodsValue] = useState<number>(0);
  const [investmentsValue, setInvestmentsValue] = useState<number>(0);
  const [debtsDue, setDebtsDue] = useState<number>(0);

  // Pure gold equivalent (85g of 24K gold is the canonical Nisab)
  const equivalentGoldGrams =
    gold24Grams + gold21Grams * (21 / 24) + gold18Grams * (18 / 24);
  const totalGoldMoneyValue = equivalentGoldGrams * goldPricePerGram24;

  const grossZakatableAssets =
    cashAndBank + totalGoldMoneyValue + tradeGoodsValue + investmentsValue;
  const netZakatableWealth = Math.max(0, grossZakatableAssets - debtsDue);

  const nisabThreshold = 85 * goldPricePerGram24;
  const isNisabReached =
    netZakatableWealth >= nisabThreshold && nisabThreshold > 0;
  const zakatDue = isNisabReached ? netZakatableWealth * 0.025 : 0;

  const resetCalculator = () => {
    setCashAndBank(0);
    setGold24Grams(0);
    setGold21Grams(0);
    setGold18Grams(0);
    setTradeGoodsValue(0);
    setInvestmentsValue(0);
    setDebtsDue(0);
  };

  const handleDownloadReport = () => {
    const reportLines = [
      '=== تقرير حساب الزكاة الشرعية — فارس TOOLS ===',
      `تاريخ التقرير: ${new Date().toISOString().slice(0, 10)}`,
      `العملة المعتمدة: ${currency}`,
      `سعر جرام الذهب عيار 24: ${goldPricePerGram24.toLocaleString('en-US')} ${currency}`,
      `قيمة النصاب الشرعي (85 جرام ذهب 24): ${nisabThreshold.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`,
      '-------------------------------------------',
      `السيولة النقدية والأرصدة البنكية: ${cashAndBank.toLocaleString('en-US')} ${currency}`,
      `قيمة الذهب المدخر (الصافي عيار 24 = ${equivalentGoldGrams.toFixed(2)} جرام): ${totalGoldMoneyValue.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`,
      `قيمة عروض التجارة والبضائع: ${tradeGoodsValue.toLocaleString('en-US')} ${currency}`,
      `الأسهم والاستثمارات المتداولة: ${investmentsValue.toLocaleString('en-US')} ${currency}`,
      `إجمالي الأصول قبل خصم الديون: ${grossZakatableAssets.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`,
      `الديون الحالة المخصومة: ${debtsDue.toLocaleString('en-US')} ${currency}`,
      '-------------------------------------------',
      `صافي الوعاء الزكوي الخاضع للزكاة: ${netZakatableWealth.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${currency}`,
      `حالة النصاب: ${isNisabReached ? 'بلغ النصاب الشرعي (تجب فيه الزكاة)' : 'لم يبلغ النصاب الشرعي'}`,
      `مقدار الزكاة الواجب إخراجها (2.5% - ربع العشر): ${zakatDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`,
    ];
    const blob = new Blob([reportLines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zakat-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Input Form Column */}
      <div
        className={`lg:col-span-7 rounded-2xl border p-6 space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center justify-between border-b pb-4 border-[#DCE7F5] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-amber-500" />
            <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
              بيانات الأصول والمدخرات الزكوية
            </h3>
          </div>
          <button
            type="button"
            onClick={resetCalculator}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687A96] hover:text-rose-500 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>تصفير القيم</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687A96] dark:text-slate-300">
              العملة المستخدمة
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            >
              <option value="ر.س">ريال سعودي (ر.س)</option>
              <option value="د.إ">درهم إماراتي (د.إ)</option>
              <option value="ج.م">جنيه مصري (ج.م)</option>
              <option value="د.ك">دينار كويتي (د.ك)</option>
              <option value="ر.ق">ريال قطري (ر.ق)</option>
              <option value="د.أ">دينار أردني (د.أ)</option>
              <option value="USD">دولار أمريكي ($)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687A96] dark:text-slate-300">
              سعر جرام الذهب عيار 24 اليوم ({currency})
            </label>
            <input
              type="number"
              min={1}
              value={goldPricePerGram24}
              onChange={(e) => setGoldPricePerGram24(Math.max(0, Number(e.target.value)))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687A96] dark:text-slate-300">
              السيولة النقدية والأرصدة البنكية ({currency})
            </label>
            <input
              type="number"
              min={0}
              value={cashAndBank}
              onChange={(e) => setCashAndBank(Math.max(0, Number(e.target.value)))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687A96] dark:text-slate-300">
              قيمة عروض التجارة والبضائع ({currency})
            </label>
            <input
              type="number"
              min={0}
              value={tradeGoodsValue}
              onChange={(e) => setTradeGoodsValue(Math.max(0, Number(e.target.value)))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#687A96] dark:text-slate-300">
              الأسهم والاستثمارات بغرض المتاجرة ({currency})
            </label>
            <input
              type="number"
              min={0}
              value={investmentsValue}
              onChange={(e) => setInvestmentsValue(Math.max(0, Number(e.target.value)))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-rose-500">
              الديون الحالة الواجب سدادها (تُخصم) ({currency})
            </label>
            <input
              type="number"
              min={0}
              value={debtsDue}
              onChange={(e) => setDebtsDue(Math.max(0, Number(e.target.value)))}
              className={`w-full rounded-xl px-3.5 py-2.5 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            />
          </div>
        </div>

        {/* Gold Weights Section */}
        <div className="pt-3 border-t border-[#DCE7F5] dark:border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">
            إضافة أوزان الذهب المدخر (بالجرام) — يتم تحويل العيارات تلقائياً إلى الصافي:
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-[#687A96]">ذهب عيار 24 (جرام)</label>
              <input
                type="number"
                min={0}
                value={gold24Grams}
                onChange={(e) => setGold24Grams(Math.max(0, Number(e.target.value)))}
                className={`w-full rounded-xl px-3 py-2 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#687A96]">ذهب عيار 21 (جرام)</label>
              <input
                type="number"
                min={0}
                value={gold21Grams}
                onChange={(e) => setGold21Grams(Math.max(0, Number(e.target.value)))}
                className={`w-full rounded-xl px-3 py-2 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-[#687A96]">ذهب عيار 18 (جرام)</label>
              <input
                type="number"
                min={0}
                value={gold18Grams}
                onChange={(e) => setGold18Grams(Math.max(0, Number(e.target.value)))}
                className={`w-full rounded-xl px-3 py-2 text-sm border tabular-nums focus:outline-none focus:border-[#1769FF] ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white'
                    : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary & Result Card Column */}
      <div
        className={`lg:col-span-5 rounded-2xl border p-6 space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
          ملخص الوعاء الزكوي والنتيجة الشرعية
        </h3>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/60 dark:border-slate-800">
            <span className="text-[#687A96]">قيمة النصاب الشرعي (85 جرام ذهب 24):</span>
            <span className="font-bold tabular-nums">
              {nisabThreshold.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
              {currency}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/60 dark:border-slate-800">
            <span className="text-[#687A96]">إجمالي الأصول قبل خصم الديون:</span>
            <span className="tabular-nums font-medium">
              {grossZakatableAssets.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-[#DCE7F5]/60 dark:border-slate-800">
            <span className="text-[#687A96]">صافي الوعاء الزكوي الخاضع للزكاة:</span>
            <span className="font-bold text-[#1769FF] tabular-nums">
              {netZakatableWealth.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}{' '}
              {currency}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-[#687A96]">حالة بلوغ النصاب الشرعي:</span>
            <span
              className={`font-bold ${
                isNisabReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'
              }`}
            >
              {isNisabReached ? 'بلغ النصاب (تجب فيه الزكاة)' : 'لم يبلغ النصاب الشرعي'}
            </span>
          </div>
        </div>

        {/* Highlighted Final Zakat Box */}
        <div
          className={`rounded-2xl p-5 text-center space-y-2 ${
            isNisabReached
              ? 'bg-[#1769FF] text-white shadow-[0_8px_20px_-4px_rgba(23,105,255,0.35)]'
              : isDark
              ? 'bg-slate-800 text-slate-300'
              : 'bg-[#F5F9FF] border border-[#DCE7F5] text-[#172B4D]'
          }`}
        >
          <div
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${
              isNisabReached ? 'text-[#EAF3FF]' : 'text-[#1769FF]'
            }`}
          >
            {isNisabReached ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>مقدار الزكاة الواجب إخراجها (2.5% - ربع العشر)</span>
              </>
            ) : (
              <>
                <Info className="w-4 h-4" />
                <span>لا زكاة واجبة لعدم بلوغ النصاب</span>
              </>
            )}
          </div>

          <div className="text-3xl font-extrabold tabular-nums tracking-tight">
            {zakatDue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            <span className="text-base font-normal opacity-85">{currency}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownloadReport}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#EAF3FF] hover:bg-[#1769FF] text-[#1769FF] hover:text-white font-bold text-xs sm:text-sm border border-[#DCE7F5] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>تنزيل تقرير الزكاة المفصل (TXT)</span>
        </button>

        <p className="text-xs text-[#687A96] leading-relaxed">
          ملاحظة شرعية: يشترط لوجوب الزكاة بلوغ المال النصاب الشرعي (ما يعادل 85 جراماً من الذهب الخالص) وحولان الحول الهجري الكامل (مرور سنة قمرية) على ملكيته.
        </p>
      </div>
    </div>
  );
};
