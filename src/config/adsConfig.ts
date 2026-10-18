/**
 * Central configuration for Google AdSense integration.
 *
 * Rules:
 * - Ads are disabled by default (`adsEnabled: false`).
 * - No fake Publisher IDs or fake Ad Unit IDs are used.
 * - Ad slots remain 100% hidden unless valid credentials are provided and ads are activated.
 * - Integration is fully compliant with Google AdSense policies.
 */

export interface AdSenseConfig {
  adsEnabled: boolean;
  publisherId: string;
  slots: {
    homeBottom: string;
    allToolsMiddle: string;
    toolDetailFooter: string;
    resultPage: string;
    inContentArticle: string;
  };
}

export const ADS_CONFIG: AdSenseConfig = {
  // Master toggle: set to true only after Google AdSense formally approves your domain
  adsEnabled: false,

  // Real Google AdSense Publisher ID (e.g., 'ca-pub-1234567890123456')
  // Kept empty until manual configuration after account approval
  publisherId: '',

  // Real Ad Unit Slot IDs created in your Google AdSense console
  // Kept empty until manual configuration
  slots: {
    homeBottom: '',
    allToolsMiddle: '',
    toolDetailFooter: '',
    resultPage: '',
    inContentArticle: '',
  },
};

/**
 * Checks whether Google AdSense is legally active and configured with a genuine Publisher ID.
 */
export function isAdSenseActive(): boolean {
  return Boolean(
    ADS_CONFIG.adsEnabled &&
    ADS_CONFIG.publisherId &&
    /^ca-pub-\d{10,}$/.test(ADS_CONFIG.publisherId.trim())
  );
}
