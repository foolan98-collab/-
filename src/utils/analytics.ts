/**
 * Google Analytics 4 (GA4) Optional Minimal Integration
 * 
 * Strict Privacy & Safety Compliance:
 * 1. Collects strictly minimal metrics: page visits, tool identifier, start/success/fail state, and language.
 * 2. FORBIDDEN: NEVER collects file names, file contents, passwords, or personal data.
 * 3. Does NOT load or initialize until a valid Measurement ID (format: G-XXXXXXXXXX) is provided
 *    and user analytics consent is granted.
 * 4. Respects browser Do Not Track (DNT) flags.
 */

export interface AnalyticsOptions {
  measurementId?: string;
  consentGranted: boolean;
  debugMode?: boolean;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

let isInitialized = false;
let currentLoadedId: string | null = null;

export function isValidGa4Id(id: string | undefined): boolean {
  if (!id) return false;
  const trimmed = id.trim();
  // Valid GA4 Measurement ID starts with G- followed by letters/digits, min 7 chars
  return /^G-[A-Za-z0-9]{4,15}$/.test(trimmed);
}

export function initGoogleAnalytics(options: AnalyticsOptions): boolean {
  if (typeof window === 'undefined') return false;

  const { measurementId, consentGranted } = options;

  // 1. Verify consent and valid measurement ID
  if (!consentGranted || !isValidGa4Id(measurementId)) {
    return false;
  }

  // 2. Respect user Do Not Track header
  if (
    navigator.doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    (navigator as any).msDoNotTrack === '1'
  ) {
    return false;
  }

  const cleanId = measurementId!.trim();

  // If already loaded with the same ID, just return
  if (isInitialized && currentLoadedId === cleanId) {
    return true;
  }

  try {
    // Inject gtag script safely
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', cleanId, {
      anonymize_ip: true,
      send_page_view: false, // We control page view tracking explicitly
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
      cleanId
    )}`;
    document.head.appendChild(script);

    isInitialized = true;
    currentLoadedId = cleanId;
    return true;
  } catch {
    return false;
  }
}

export function trackPageView(path: string, title: string, lang: string): void {
  if (typeof window === 'undefined' || !isInitialized || !window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href,
      language: lang,
    });
  } catch {
    // Ignore tracking failures gracefully
  }
}

export interface MinimalToolEvent {
  toolSlug: string;
  toolName: string;
  lang: string;
  status: 'start' | 'success' | 'fail';
  durationMs?: number;
}

/**
 * Tracks tool usage lifecycle safely.
 * Notice: absolutely NO file data, input content, or credentials are accepted or sent.
 */
export function trackToolUsageEvent(event: MinimalToolEvent): void {
  if (typeof window === 'undefined' || !isInitialized || !window.gtag) return;

  try {
    // Sanitize parameters to ensure zero accidental exposure of private data
    const sanitizedPayload = {
      tool_slug: String(event.toolSlug || '').slice(0, 50),
      tool_name: String(event.toolName || '').slice(0, 80),
      app_language: event.lang === 'en' ? 'en' : 'ar',
      event_status: event.status,
      ...(typeof event.durationMs === 'number'
        ? { duration_ms: Math.round(event.durationMs) }
        : {}),
    };

    const gaEventName =
      event.status === 'start'
        ? 'tool_start'
        : event.status === 'success'
        ? 'tool_success'
        : 'tool_fail';

    window.gtag('event', gaEventName, sanitizedPayload);
  } catch {
    // Ignore tracking failures gracefully
  }
}
