export interface AdConfig {
  /**
   * Master switch to enable or disable AdSense globally.
   * Defaults to false to ensure no ads/scripts load until valid account setup.
   */
  enabled: boolean;
  /**
   * Google AdSense Publisher ID (e.g., 'ca-pub-XXXXXXXXXXXXXXXX')
   * Must only be provided when user configures their real approved account.
   */
  publisherId?: string;
  /**
   * Whether to display reserved outline boxes for developer layout preview.
   */
  previewPlaceholders?: boolean;
  /**
   * Specific ad unit slots configured by publisher.
   */
  slots: {
    homeLeaderboard?: string;
    homeMidFeed?: string;
    toolSidebar?: string;
    toolBelowGuide?: string;
    articleFooter?: string;
  };
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  enabled: false,
  publisherId: '',
  previewPlaceholders: false,
  slots: {},
};

export const AD_CONFIG_STORAGE_KEY = 'fares_tools_ads_config_v1';
