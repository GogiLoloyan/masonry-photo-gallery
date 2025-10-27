import type { Metric, ReportOpts } from 'web-vitals';

/**
 * Web Vitals thresholds based on Google's recommendations
 * https://web.dev/articles/defining-core-web-vitals-thresholds
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
} as const;

/**
 * Enhanced metric data with additional context
 */
interface EnhancedMetric extends Metric {
  // Add custom properties for better debugging
  url?: string;
  timestamp?: number;
  userAgent?: string;
  connection?: string;
}

/**
 * Queue for batching metrics before sending
 */
class MetricsQueue {
  private queue: EnhancedMetric[] = [];
  private readonly maxSize = 10;
  private readonly flushInterval = 30000; // 30 seconds
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onFlush: (metrics: EnhancedMetric[]) => void;

  constructor(onFlush: (metrics: EnhancedMetric[]) => void) {
    this.onFlush = onFlush;

    // Flush on page visibility change (user leaving)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush();
        }
      });
    }

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', () => this.flush());
    }
  }

  add(metric: EnhancedMetric) {
    this.queue.push(metric);

    if (this.queue.length >= this.maxSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }
  }

  flush() {
    if (this.queue.length === 0) return;

    this.onFlush([...this.queue]);
    this.queue = [];

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * Reports Web Vitals metrics with professional best practices:
 * - Dynamic import for code splitting
 * - Error handling
 * - Attribution support for debugging
 * - Proper typing
 */
export function reportWebVitals(
  onPerfEntry?: (metric: Metric) => void,
  options?: ReportOpts
) {
  if (!onPerfEntry || typeof onPerfEntry !== 'function') {
    return;
  }

  // Dynamic import to avoid blocking initial load
  import('web-vitals')
    .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      // Report Core Web Vitals
      onCLS(onPerfEntry, options);
      onINP(onPerfEntry, options);
      onFCP(onPerfEntry, options);
      onLCP(onPerfEntry, options);
      onTTFB(onPerfEntry, options);
    })
    .catch((error) => {
      console.error('Failed to load web-vitals:', error);
    });
}

/**
 * Enhanced console logger with detailed information
 */
export function logWebVitals(metric: Metric) {
  const { name, value, rating, id, navigationType } = metric;

  // Color code based on rating
  const emoji = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';

  // Format value based on metric type
  const formattedValue = name === 'CLS'
    ? value.toFixed(3)
    : `${Math.round(value)}ms`;

  console.group(`${emoji} ${name}: ${formattedValue} (${rating})`);
  console.log('Metric ID:', id);
  console.log('Navigation Type:', navigationType);

  // Log attribution data if available (for debugging)
  if ('attribution' in metric) {
    console.log('Attribution:', (metric as any).attribution);
  }

  console.groupEnd();
}

/**
 * Professional analytics handler with batching and retry logic
 */
let metricsQueue: MetricsQueue | null = null;

export function sendToAnalytics(metric: Metric) {
  // Enhance metric with additional context
  const enhancedMetric: EnhancedMetric = {
    ...metric,
    url: window.location.href,
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType,
  };

  // Initialize queue on first use
  if (!metricsQueue) {
    metricsQueue = new MetricsQueue(batchSendMetrics);
  }

  metricsQueue.add(enhancedMetric);
}

/**
 * Batch send metrics to analytics endpoint
 */
function batchSendMetrics(metrics: EnhancedMetric[]) {
  // Use sendBeacon for reliable delivery even during page unload
  const data = JSON.stringify({
    metrics,
    page: window.location.pathname,
    timestamp: Date.now(),
  });

  // Try sendBeacon first (most reliable)
  if (navigator.sendBeacon) {
    const sent = navigator.sendBeacon('/api/analytics/web-vitals', data);
    if (sent) return;
  }

  // Fallback to fetch with keepalive
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: data,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch((error) => {
    // In production, you might want to use a error reporting service
    console.error('Failed to send Web Vitals:', error);
  });
}

/**
 * Get rating for a metric value
 */
export function getRating(metric: Metric): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITALS_THRESHOLDS[metric.name as keyof typeof WEB_VITALS_THRESHOLDS];

  if (!thresholds) return metric.rating;

  if (metric.value <= thresholds.good) return 'good';
  if (metric.value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Initialize Web Vitals with attribution for better debugging
 * Use this for detailed performance analysis
 */
export function reportWebVitalsWithAttribution(onPerfEntry?: (metric: Metric) => void) {
  if (!onPerfEntry || typeof onPerfEntry !== 'function') {
    return;
  }

  import('web-vitals/attribution')
    .then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      // These versions include attribution data for debugging
      onCLS(onPerfEntry);
      onINP(onPerfEntry);
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    })
    .catch((error) => {
      console.error('Failed to load web-vitals/attribution:', error);
    });
}
