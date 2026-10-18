import React, { useState, useRef, useEffect } from 'react';
import {
  Gauge,
  Play,
  Square,
  RotateCcw,
  Wifi,
  Download,
  Upload,
  Activity,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SpeedTestResult {
  ping: number; // ms
  jitter: number; // ms
  download: number; // Mbps
  upload: number | null; // Mbps
  timestamp: string;
}

// Reliable, CORS-enabled public CDN endpoints for network throughput measurement
const DOWNLOAD_PAYLOAD_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js', // ~2.4MB
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', // ~600KB
  'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js', // ~70KB
];

const PING_ENDPOINT = 'https://cdnjs.cloudflare.com/favicon.ico';

export const InternetSpeedTestWorkspace: React.FC = () => {
  const { settings, lang } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';

  const [phase, setPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'completed'>('idle');
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [ping, setPing] = useState<number | null>(null);
  const [jitter, setJitter] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [testHistory, setTestHistory] = useState<SpeedTestResult[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleStopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setPhase('idle');
    setStatusMessage(isEn ? 'Speed test cancelled.' : 'تم إيقاف الاختبار.');
  };

  const handleStartTest = async () => {
    if (phase !== 'idle' && phase !== 'completed') return;

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setErrorMsg('');
    setCurrentSpeed(0);
    setPing(null);
    setJitter(null);
    setDownloadSpeed(null);
    setUploadSpeed(null);

    try {
      // ----------------------------------------------------
      // PHASE 1: PING & JITTER
      // ----------------------------------------------------
      setPhase('ping');
      setStatusMessage(isEn ? 'Measuring latency (Ping) and Jitter...' : 'جارٍ قياس زمن الاستجابة (Ping) واستقرار الاتصال (Jitter)...');

      const pingSamples: number[] = [];
      const numPingRuns = 6;

      for (let i = 0; i < numPingRuns; i++) {
        if (signal.aborted) return;
        const start = performance.now();
        try {
          const res = await fetch(`${PING_ENDPOINT}?_t=${Date.now()}_${i}`, {
            method: 'GET',
            cache: 'no-store',
            signal,
          });
          await res.blob();
          const rtt = Math.round(performance.now() - start);
          pingSamples.push(rtt);
        } catch (err: any) {
          if (signal.aborted) return;
          // Continue if single sample dropped
        }
      }

      if (pingSamples.length === 0) {
        throw new Error(isEn ? 'Failed to connect to network test server.' : 'تعذر الاتصال بخادم قياس الشبكة.');
      }

      // Calculate Ping (minimum round-trip time) and average
      const minPing = Math.min(...pingSamples);
      setPing(minPing);

      // Calculate Jitter (mean absolute deviation of successive samples)
      let jitterSum = 0;
      for (let i = 1; i < pingSamples.length; i++) {
        jitterSum += Math.abs(pingSamples[i] - pingSamples[i - 1]);
      }
      const calculatedJitter = pingSamples.length > 1 ? Math.round(jitterSum / (pingSamples.length - 1)) : 1;
      setJitter(calculatedJitter);

      // ----------------------------------------------------
      // PHASE 2: DOWNLOAD THROUGHPUT
      // ----------------------------------------------------
      setPhase('download');
      setStatusMessage(isEn ? 'Measuring download throughput...' : 'جارٍ قياس سرعة التنزيل الفعلية (Download)...');

      let totalBytesReceived = 0;
      const downloadStartTime = performance.now();

      // Download streams across multiple CORS CDN assets
      for (const assetUrl of DOWNLOAD_PAYLOAD_URLS) {
        if (signal.aborted) return;

        const response = await fetch(`${assetUrl}?_t=${Date.now()}`, {
          cache: 'no-store',
          signal,
        });

        if (!response.body) {
          const blob = await response.blob();
          totalBytesReceived += blob.size;
          const elapsedSec = (performance.now() - downloadStartTime) / 1000;
          if (elapsedSec > 0) {
            const currentMbps = Number(((totalBytesReceived * 8) / (elapsedSec * 1000000)).toFixed(2));
            setCurrentSpeed(currentMbps);
          }
          continue;
        }

        const reader = response.body.getReader();
        while (true) {
          if (signal.aborted) return;
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytesReceived += value.length;
            const elapsedSec = (performance.now() - downloadStartTime) / 1000;
            if (elapsedSec > 0.2) {
              const currentMbps = Number(((totalBytesReceived * 8) / (elapsedSec * 1000000)).toFixed(2));
              setCurrentSpeed(currentMbps);
            }
          }
        }
      }

      const totalDownloadTimeSec = Math.max(0.3, (performance.now() - downloadStartTime) / 1000);
      const finalDownloadMbps = Number(((totalBytesReceived * 8) / (totalDownloadTimeSec * 1000000)).toFixed(2));
      setDownloadSpeed(finalDownloadMbps);
      setCurrentSpeed(finalDownloadMbps);

      // ----------------------------------------------------
      // PHASE 3: UPLOAD MEASUREMENT
      // ----------------------------------------------------
      setPhase('upload');
      setStatusMessage(isEn ? 'Estimating upload speed...' : 'جارٍ فحص كفاءة الرفع (Upload)...');

      let finalUploadMbps: number | null = null;
      try {
        // Safe small test payload (~512KB of zero-filled buffers)
        const payloadSize = 512 * 1024;
        const uploadBuffer = new Uint8Array(payloadSize);
        window.crypto.getRandomValues(uploadBuffer.subarray(0, 64)); // Add small randomness

        const uploadStart = performance.now();
        // Send to httpbin test echo
        const uploadRes = await fetch('https://httpbin.org/post', {
          method: 'POST',
          body: uploadBuffer,
          signal,
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        });

        if (uploadRes.ok) {
          const uploadTimeSec = (performance.now() - uploadStart) / 1000;
          if (uploadTimeSec > 0.1) {
            finalUploadMbps = Number(((payloadSize * 8) / (uploadTimeSec * 1000000)).toFixed(2));
            setUploadSpeed(finalUploadMbps);
          }
        }
      } catch (err: any) {
        if (signal.aborted) return;
        // If external POST is blocked by CORS/ISP, we honestly report null
        setUploadSpeed(null);
      }

      // ----------------------------------------------------
      // PHASE 4: COMPLETED
      // ----------------------------------------------------
      setPhase('completed');
      setStatusMessage(isEn ? 'Speed test completed successfully!' : 'اكتمل اختبار سرعة الإنترنت بنجاح!');

      const newRecord: SpeedTestResult = {
        ping: minPing,
        jitter: calculatedJitter,
        download: finalDownloadMbps,
        upload: finalUploadMbps,
        timestamp: new Date().toLocaleTimeString(isEn ? 'en-US' : 'ar-EG'),
      };
      setTestHistory((prev) => [newRecord, ...prev.slice(0, 4)]);
    } catch (err: any) {
      if (signal.aborted) return;
      setPhase('idle');
      setErrorMsg(err?.message || (isEn ? 'Error occurred during test. Please retry.' : 'حدث خطأ أثناء إجراء الاختبار. يرجى المحاولة ثانية.'));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Speedometer Display */}
      <div
        className={`rounded-3xl border p-6 sm:p-10 text-center relative overflow-hidden ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-[#DCE7F5] shadow-[0_8px_30px_rgba(23,105,255,0.06)]'
        }`}
      >
        {/* Glow indicator */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none ${
            phase !== 'idle' && phase !== 'completed'
              ? 'bg-[#1769FF]/20 animate-pulse'
              : 'bg-[#1769FF]/5'
          }`}
        />

        {/* Central Speed Gauge */}
        <div className="relative z-10 max-w-sm mx-auto space-y-4 py-4">
          <div className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-full border-8 border-dashed border-[#DCE7F5] dark:border-slate-800 flex flex-col items-center justify-center p-4 relative">
            <div
              className={`absolute inset-0 rounded-full border-4 transition-all duration-300 ${
                phase === 'download'
                  ? 'border-[#1769FF] animate-spin'
                  : phase === 'upload'
                  ? 'border-emerald-500 animate-spin'
                  : phase === 'ping'
                  ? 'border-amber-400 animate-pulse'
                  : 'border-transparent'
              }`}
            />

            <Gauge className={`w-8 h-8 mb-1 ${
              phase === 'download'
                ? 'text-[#1769FF]'
                : phase === 'upload'
                ? 'text-emerald-500'
                : 'text-[#687A96]'
            }`} />

            <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight text-[#172B4D] dark:text-white">
              {phase === 'ping' ? (ping !== null ? ping : '--') : currentSpeed.toFixed(1)}
            </div>

            <span className="text-xs sm:text-sm font-extrabold text-[#687A96] dark:text-slate-400 uppercase tracking-wider">
              {phase === 'ping' ? (isEn ? 'ms (Ping)' : 'مللي ثانية') : (isEn ? 'Mbps' : 'ميجابت/ث')}
            </span>
          </div>

          {/* Status Message */}
          <p className="text-sm font-bold text-[#1769FF] min-h-[24px]">
            {statusMessage || (isEn ? 'Ready to test your connection speed' : 'جاهز لبدء قياس سرعة الاتصال بالإنترنت')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {phase === 'idle' || phase === 'completed' ? (
              <button
                type="button"
                onClick={handleStartTest}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#1769FF] hover:bg-[#0755E9] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#1769FF]/25 transition-all cursor-pointer active:scale-95"
              >
                {phase === 'completed' ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
                <span>{phase === 'completed' ? (isEn ? 'Retest Speed' : 'إعادة الاختبار') : (isEn ? 'Start Speed Test' : 'ابدأ اختبار السرعة')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopTest}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-rose-500/25 transition-all cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{isEn ? 'Stop Test' : 'إيقاف الاختبار'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Real Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-8 border-t border-[#DCE7F5] dark:border-slate-800">
          {/* Download */}
          <div
            className={`p-4 rounded-2xl border text-start space-y-1 ${
              phase === 'download'
                ? 'border-[#1769FF] bg-[#1769FF]/5 ring-2 ring-[#1769FF]/20'
                : isDark
                ? 'bg-slate-950/60 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#1769FF]">
              <Download className="w-4 h-4" />
              <span>{isEn ? 'Download' : 'سرعة التنزيل'}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#172B4D] dark:text-white tabular-nums">
              {downloadSpeed !== null ? downloadSpeed : '--'}
            </div>
            <p className="text-[11px] text-[#687A96]">{isEn ? 'Mbps' : 'ميجابت / ثانية'}</p>
          </div>

          {/* Upload */}
          <div
            className={`p-4 rounded-2xl border text-start space-y-1 ${
              phase === 'upload'
                ? 'border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20'
                : isDark
                ? 'bg-slate-950/60 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Upload className="w-4 h-4" />
              <span>{isEn ? 'Upload' : 'سرعة الرفع'}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#172B4D] dark:text-white tabular-nums">
              {uploadSpeed !== null ? uploadSpeed : phase === 'completed' ? 'N/A' : '--'}
            </div>
            <p className="text-[11px] text-[#687A96]">{isEn ? 'Mbps' : 'ميجابت / ثانية'}</p>
          </div>

          {/* Ping */}
          <div
            className={`p-4 rounded-2xl border text-start space-y-1 ${
              phase === 'ping'
                ? 'border-amber-400 bg-amber-400/5 ring-2 ring-amber-400/20'
                : isDark
                ? 'bg-slate-950/60 border-slate-800'
                : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
              <Activity className="w-4 h-4" />
              <span>{isEn ? 'Ping (Latency)' : 'زمن الاستجابة'}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#172B4D] dark:text-white tabular-nums">
              {ping !== null ? ping : '--'}
            </div>
            <p className="text-[11px] text-[#687A96]">{isEn ? 'ms' : 'مللي ثانية'}</p>
          </div>

          {/* Jitter */}
          <div
            className={`p-4 rounded-2xl border text-start space-y-1 ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-[#F5F9FF] border-[#DCE7F5]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-500">
              <Wifi className="w-4 h-4" />
              <span>{isEn ? 'Jitter (Stability)' : 'التذبذب (Jitter)'}</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#172B4D] dark:text-white tabular-nums">
              {jitter !== null ? jitter : '--'}
            </div>
            <p className="text-[11px] text-[#687A96]">{isEn ? 'ms' : 'مللي ثانية'}</p>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Transparency & Integrity Card */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 space-y-3 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-bold text-[#1769FF]">
          <ShieldCheck className="w-4 h-4" />
          <span>{isEn ? 'Accuracy & Transparency Standards' : 'معايير الدقة والشفافية في القياس:'}</span>
        </div>
        <ul className="text-xs sm:text-sm text-[#687A96] dark:text-slate-300 space-y-2 leading-relaxed">
          <li>
            • <strong>نتائج حقيقية 100%:</strong> لا نقوم باختلاق أو محاكاة أي أرقام؛ يتم قياس السرعة الفعلية عبر حساب حجم البيانات المنقولة لحظياً وقسمتها على الوقت المستغرق بدقة أجزاء من الثانية.
          </li>
          <li>
            • <strong>ترشيد استهلاك البيانات:</strong> الاختبار مصمم بحزم خفيفة (أقل من 8 ميجابايت إجمالاً) لعدم استنزاف باقات الإنترنت على الهواتف.
          </li>
          <li>
            • <strong>خصوصية تامة:</strong> لا يتم تسجيل عنوان IP أو موفر الخدمة أو إرسال أي معلومات شخصية إلى خوادم خارجية.
          </li>
        </ul>
      </div>

      {/* Test History in Session */}
      {testHistory.length > 0 && (
        <div
          className={`rounded-2xl border p-5 sm:p-6 space-y-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-[#DCE7F5]'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-bold text-[#172B4D] dark:text-white">
            <Clock className="w-4 h-4 text-[#1769FF]" />
            <span>{isEn ? 'Recent Tests in this Session' : 'نتائج الاختبارات السابقة في هذه الجلسة'}</span>
          </div>

          <div className="divide-y divide-[#DCE7F5] dark:divide-slate-800 rounded-xl border border-[#DCE7F5] dark:border-slate-800 overflow-hidden">
            {testHistory.map((rec, idx) => (
              <div
                key={idx}
                className={`p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs ${
                  isDark ? 'bg-slate-950/40' : 'bg-[#F5F9FF]/50'
                }`}
              >
                <span className="font-bold text-[#687A96]">{rec.timestamp}</span>
                <div className="flex items-center gap-4 font-mono font-bold">
                  <span className="text-[#1769FF]">
                    تنزيل: {rec.download} Mbps
                  </span>
                  {rec.upload !== null && (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      رفع: {rec.upload} Mbps
                    </span>
                  )}
                  <span className="text-amber-600 dark:text-amber-400">
                    استجابة: {rec.ping} ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
