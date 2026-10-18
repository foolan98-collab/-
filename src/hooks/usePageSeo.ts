import { useEffect } from 'react';
import { trackPageView } from '../utils/analytics';

interface UsePageSeoProps {
  title: string;
  description: string;
  canonicalPath?: string;
  lang?: 'ar' | 'en';
  noIndex?: boolean;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>> | null;
}

const BASE_URL = 'https://fares-tools.com';
const BRAND_SUFFIX_AR = 'فارس TOOLS';
const BRAND_SUFFIX_EN = 'Fares Tools';

export function usePageSeo({
  title,
  description,
  canonicalPath = '',
  lang = 'ar',
  noIndex = false,
  keywords,
  jsonLd = null,
}: UsePageSeoProps) {
  useEffect(() => {
    const isEn = lang === 'en';
    const brandSuffix = isEn ? BRAND_SUFFIX_EN : BRAND_SUFFIX_AR;

    // 1. Dynamic document title
    const fullTitle =
      title.includes(brandSuffix) || title.includes('Fares Tools')
        ? title
        : `${title} | ${brandSuffix}`;
    document.title = fullTitle;

    // Optional safe page view dispatch
    trackPageView(canonicalPath || window.location.pathname, fullTitle, lang);

    // 2. Helper to set or create meta tags
    const setMeta = (attrName: string, attrVal: string, content: string) => {
      let meta = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attrName, attrVal);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Fares Tools | فارس TOOLS');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:card', 'summary_large_image');

    // Language / Locale OpenGraph tags
    setMeta('property', 'og:locale', isEn ? 'en_US' : 'ar_AR');
    setMeta(
      'property',
      'og:locale:alternate',
      isEn ? 'ar_AR' : 'en_US'
    );

    // Robots meta tag: noindex on private user pages (settings, favorites, process)
    if (noIndex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      setMeta('name', 'robots', 'index, follow');
    }

    // Optional keywords
    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }

    // 3. Dynamic canonical & alternate hreflang URLs
    const cleanPath = canonicalPath.startsWith('/')
      ? canonicalPath
      : `/${canonicalPath}`;
    const normalizedPath = cleanPath === '/' ? '' : cleanPath;

    const arabicUrl = `${BASE_URL}${normalizedPath}`;
    const englishUrl = `${BASE_URL}${normalizedPath}${normalizedPath.includes('?') ? '&' : '?'}lang=en`;
    const canonicalUrl = isEn ? englishUrl : arabicUrl;

    setMeta('property', 'og:url', canonicalUrl);

    // Set canonical link
    let linkCanonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.rel = 'canonical';
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.href = canonicalUrl;

    // Helper for hreflang tags
    const setHreflang = (hreflangVal: string, hrefVal: string) => {
      let link = document.querySelector<HTMLLinkElement>(
        `link[rel="alternate"][hreflang="${hreflangVal}"]`
      );
      if (!link) {
        link = document.createElement('link');
        link.rel = 'alternate';
        link.setAttribute('hreflang', hreflangVal);
        document.head.appendChild(link);
      }
      link.href = hrefVal;
    };

    if (!noIndex) {
      setHreflang('ar', arabicUrl);
      setHreflang('en', englishUrl);
      setHreflang('x-default', arabicUrl);
    }

    // 4. Dynamic JSON-LD structured data
    const existingJsonLd = document.getElementById('dynamic-page-jsonld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = 'dynamic-page-jsonld';
      script.type = 'application/ld+json';
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    return () => {
      const currentJsonLd = document.getElementById('dynamic-page-jsonld');
      if (currentJsonLd) currentJsonLd.remove();
    };
  }, [title, description, canonicalPath, lang, noIndex, keywords, jsonLd]);
}
