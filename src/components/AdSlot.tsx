import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ADS_CONFIG, isAdSenseActive } from '../config/adsConfig';

export type AdPlacement =
  | 'home-bottom'
  | 'all-tools-middle'
  | 'tool-detail-footer'
  | 'result-page'
  | 'in-content';

interface AdSlotProps {
  placement?: AdPlacement;
  slotId?: string;
  format?: 'horizontal' | 'rectangle' | 'responsive';
  className?: string;
  adClient?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

/**
 * Loads the official Google AdSense script asynchronously once without duplicate script tags.
 */
function useAdSenseScriptLoader(active: boolean, publisherId: string) {
  useEffect(() => {
    if (!active || !publisherId || typeof document === 'undefined') return;

    const scriptId = 'google-adsense-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
      publisherId
    )}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [active, publisherId]);
}

/**
 * Central Reusable AdSlot Component for Fares Tools.
 *
 * Design & Policy Rules:
 * 1. Remains 100% invisible (renders null) if ads are inactive or unconfigured.
 * 2. When active, reserves exact minimal dimensions to prevent Cumulative Layout Shift (CLS).
 * 3. Clearly demarcated as an advertisement — never confused with buttons, tool cards, or download links.
 * 4. Loads AdSense asynchronously without blocking page rendering or route navigation.
 * 5. In development/testing preview mode (`settings.showAdPlaceholders` or `adConfig.previewPlaceholders`), displays an honest dashed preview box.
 */
export const AdSlot: React.FC<AdSlotProps> = ({
  placement = 'home-bottom',
  slotId,
  format = 'horizontal',
  className = '',
  adClient,
}) => {
  const { settings, lang, adConfig } = useApp();
  const isDark = settings.theme === 'dark';
  const isEn = lang === 'en';
  const insRef = useRef<HTMLModElement | null>(null);

  const effectiveAdClient =
    adClient ||
    (adConfig?.publisherId && /^ca-pub-\d{10,}$/.test(adConfig.publisherId.trim())
      ? adConfig.publisherId.trim()
      : ADS_CONFIG.publisherId);

  const active =
    isAdSenseActive() ||
    Boolean(
      adConfig?.enabled &&
      effectiveAdClient &&
      /^ca-pub-\d{10,}$/.test(effectiveAdClient)
    );

  // Resolve slot ID from placement if not explicitly provided
  const resolvedSlotId =
    slotId ||
    (placement === 'home-bottom'
      ? ADS_CONFIG.slots.homeBottom || adConfig?.slots?.homeLeaderboard
      : placement === 'all-tools-middle'
      ? ADS_CONFIG.slots.allToolsMiddle || adConfig?.slots?.homeMidFeed
      : placement === 'tool-detail-footer'
      ? ADS_CONFIG.slots.toolDetailFooter || adConfig?.slots?.toolBelowGuide
      : placement === 'result-page'
      ? ADS_CONFIG.slots.resultPage || adConfig?.slots?.articleFooter
      : ADS_CONFIG.slots.inContentArticle);

  useAdSenseScriptLoader(active, effectiveAdClient);

  // Trigger AdSense fill once DOM element is rendered
  useEffect(() => {
    if (active && resolvedSlotId && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Safe catch for adblockers or network dropouts
      }
    }
  }, [active, resolvedSlotId]);

  // Case 1: Live AdSense is active and configured
  if (active && resolvedSlotId) {
    const minHeightClass =
      format === 'horizontal'
        ? 'min-h-[90px]'
        : format === 'rectangle'
        ? 'min-h-[250px]'
        : 'min-h-[100px] sm:min-h-[120px]';

    return (
      <aside
        aria-label={isEn ? 'Advertisement' : 'إعلان'}
        className={`w-full overflow-hidden my-6 flex flex-col items-center justify-center ${minHeightClass} ${className}`}
      >
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 select-none">
            {isEn ? 'Advertisement' : 'إعلان'}
          </span>
          <ins
            ref={insRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client={effectiveAdClient}
            data-ad-slot={resolvedSlotId}
            data-ad-format={format === 'responsive' ? 'auto' : format}
            data-full-width-responsive="true"
          />
        </div>
      </aside>
    );
  }

  // Case 2: Placeholder mode for site layout inspection (enabled in Settings)
  if (settings.showAdPlaceholders || adConfig?.previewPlaceholders) {
    return (
      <aside
        data-ad-slot-preview={placement}
        aria-label={isEn ? 'Reserved Ad Placement (Inactive)' : 'مساحة إعلانية محجوزة (معطلة حالياً)'}
        className={`w-full max-w-4xl mx-auto rounded-2xl border border-dashed my-6 transition-colors ${
          format === 'horizontal'
            ? 'min-h-[90px] py-4 px-6'
            : format === 'rectangle'
            ? 'min-h-[250px] p-6'
            : 'min-h-[100px] p-4'
        } flex flex-col items-center justify-center text-center ${
          isDark
            ? 'bg-slate-900/40 border-slate-800 text-slate-500'
            : 'bg-[#F5F9FF] border-[#DCE7F5] text-slate-400'
        } ${className}`}
      >
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-500/80" />
          <span>
            {isEn
              ? `AdSense Placement Slot: [${placement}]`
              : `مساحة إعلانية مجهزة للتكامل: [${placement}]`}
          </span>
        </div>
        <p className="text-[11px] opacity-75 mt-1 max-w-md">
          {isEn
            ? 'AdSense is currently disabled pending official domain review and approval.'
            : 'الإعلانات معطلة حالياً احتراماً لسياسات Google AdSense قبل إتمام المراجعة وقبول الدومين.'}
        </p>
      </aside>
    );
  }

  // Case 3: Inactive & no placeholder -> render null (0 DOM footprint, 0 CLS)
  return null;
};

// Backwards-compatible exports
export const AdBanner = AdSlot;
export const AdSlotReservation = AdSlot;
