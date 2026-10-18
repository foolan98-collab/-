import React, { useState } from 'react';
import { QrCode, Download } from 'lucide-react';
import QRCode from 'qrcode';
import { useApp } from '../../context/AppContext';

export const QrGeneratorWorkspace: React.FC = () => {
  const { settings } = useApp();
  const isDark = settings.theme === 'dark';

  const [inputValue, setInputValue] = useState('https://fares.tools');
  const [qrSize, setQrSize] = useState(400);
  const [fgColor, setFgColor] = useState('#172B4D');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!canvasRef.current) return;
    const payload = inputValue.trim() || 'https://fares.tools';
    void QRCode.toCanvas(canvasRef.current, payload, {
      width: qrSize,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: fgColor,
        light: bgColor,
      },
    });
  }, [inputValue, qrSize, fgColor, bgColor]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `fares-tools-qr-${qrSize}px.png`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div
        className={`lg:col-span-7 rounded-2xl border p-6 space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 border-b pb-3 border-[#DCE7F5] dark:border-slate-800">
          <QrCode className="w-5 h-5 text-[#1769FF]" />
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
            بيانات وتخصيص رمز QR Code
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-[#172B4D] dark:text-slate-300">
            الرابط أو النص المراد تحويله إلى QR Code
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://example.com أو أي نص عربي أو رقم هاتف..."
            className={`w-full rounded-xl px-4 py-3 text-sm border focus:outline-none focus:border-[#1769FF] ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-white'
                : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
            }`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687A96]">
              الأبعاد والدقة (بكسل)
            </label>
            <select
              value={qrSize}
              onChange={(e) => setQrSize(Number(e.target.value))}
              className={`w-full rounded-xl px-3 py-2.5 text-sm border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-[#F5F9FF] border-[#DCE7F5] text-[#172B4D]'
              }`}
            >
              <option value={250}>250 × 250 بكسل</option>
              <option value={400}>400 × 400 بكسل (قياسي)</option>
              <option value={800}>800 × 800 بكسل (طباعة عالية)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687A96]">لون الرمز</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-xs font-en uppercase text-[#687A96]">{fgColor}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#687A96]">لون الخلفية</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-0"
              />
              <span className="text-xs font-en uppercase text-[#687A96]">{bgColor}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              setFgColor('#1769FF');
              setBgColor('#FFFFFF');
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#DCE7F5] dark:border-slate-700 hover:border-[#1769FF] cursor-pointer"
          >
            أزرق Fares Tools
          </button>
          <button
            type="button"
            onClick={() => {
              setFgColor('#0755E9');
              setBgColor('#F5F9FF');
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#DCE7F5] dark:border-slate-700 hover:border-[#1769FF] cursor-pointer"
          >
            أزرق ساطع
          </button>
          <button
            type="button"
            onClick={() => {
              setFgColor('#172B4D');
              setBgColor('#FFFFFF');
            }}
            className="text-xs px-3 py-1.5 rounded-lg border border-[#DCE7F5] dark:border-slate-700 hover:border-[#1769FF] cursor-pointer"
          >
            كلاسيكي داكن
          </button>
        </div>
      </div>

      {/* Live Preview & Download */}
      <div
        className={`lg:col-span-5 rounded-2xl border p-6 flex flex-col items-center text-center space-y-5 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#172B4D]'}`}>
          معاينة مباشرة لرمز QR
        </h4>

        <div className="p-4 rounded-2xl bg-[#F5F9FF] dark:bg-slate-950 border border-[#DCE7F5] dark:border-slate-800">
          <canvas
            ref={canvasRef}
            className="w-52 h-52 sm:w-60 sm:h-60 rounded-xl shadow-xs"
          />
        </div>

        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!inputValue.trim()}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1769FF] hover:bg-[#0755E9] disabled:opacity-50 text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>تحميل رمز QR بصيغة PNG ({qrSize}px)</span>
        </button>
      </div>
    </div>
  );
};
