/**
 * Local privacy-first tool execution metrics.
 * Operates 100% inside the user's browser localStorage without sending any sensitive data.
 * Adheres to truth-in-reporting: No mock or fabricated numbers.
 */

import { getToolBySlug } from '../data/toolsCatalog';

const METRICS_STORAGE_KEY = 'fares_tools_metrics_v1';

export interface ToolMetricRecord {
  slug: string;
  name: string;
  nameEn: string;
  startCount: number;
  successCount: number;
  failureCount: number;
  lastUsedAt: string | null;
}

export interface SystemMetricsSummary {
  totalExecutions: number;
  totalSuccesses: number;
  totalFailures: number;
  tools: Record<string, ToolMetricRecord>;
}

const DEFAULT_METRICS: SystemMetricsSummary = {
  totalExecutions: 0,
  totalSuccesses: 0,
  totalFailures: 0,
  tools: {},
};

export function getStoredMetrics(): SystemMetricsSummary {
  if (typeof window === 'undefined') return DEFAULT_METRICS;
  try {
    const raw = localStorage.getItem(METRICS_STORAGE_KEY);
    if (!raw) return DEFAULT_METRICS;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.tools === 'object') {
      return parsed as SystemMetricsSummary;
    }
  } catch {
    // ignore parse error
  }
  return DEFAULT_METRICS;
}

export function saveMetrics(metrics: SystemMetricsSummary): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    // ignore storage error
  }
}

export function recordToolMetric(
  slug: string,
  event: 'start' | 'success' | 'fail'
): void {
  if (typeof window === 'undefined') return;
  const metrics = getStoredMetrics();
  const tool = getToolBySlug(slug);

  if (!metrics.tools[slug]) {
    metrics.tools[slug] = {
      slug,
      name: tool?.name || slug,
      nameEn: tool?.nameEn || slug,
      startCount: 0,
      successCount: 0,
      failureCount: 0,
      lastUsedAt: null,
    };
  }

  const record = metrics.tools[slug];
  record.lastUsedAt = new Date().toISOString();

  if (event === 'start') {
    metrics.totalExecutions += 1;
    record.startCount += 1;
  } else if (event === 'success') {
    metrics.totalSuccesses += 1;
    record.successCount += 1;
  } else if (event === 'fail') {
    metrics.totalFailures += 1;
    record.failureCount += 1;
  }

  saveMetrics(metrics);
}

export function clearStoredMetrics(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(METRICS_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getMostUsedTools(limit = 6): ToolMetricRecord[] {
  const metrics = getStoredMetrics();
  const list = Object.values(metrics.tools);
  return list
    .filter((t) => t.startCount > 0)
    .sort((a, b) => b.startCount - a.startCount)
    .slice(0, limit);
}

export function getFailingTools(): ToolMetricRecord[] {
  const metrics = getStoredMetrics();
  const list = Object.values(metrics.tools);
  return list
    .filter((t) => t.failureCount > 0)
    .sort((a, b) => b.failureCount - a.failureCount);
}
