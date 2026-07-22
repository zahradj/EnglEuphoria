/**
 * Production monitoring dashboard - console utility for debugging
 * Use in browser console: productionMonitor.getReport()
 */

interface PerformanceMetrics {
  slowQueries: Array<{ name: string; duration: number; timestamp: number }>;
  failedQueries: Array<{ name: string; error: string; timestamp: number }>;
  slowRenders: Array<{ component: string; duration: number; timestamp: number }>;
}

class ProductionMonitor {
  private metrics: PerformanceMetrics = {
    slowQueries: [],
    failedQueries: [],
    slowRenders: [],
  };

  private maxStoredMetrics = 100;

  logSlowQuery(name: string, duration: number) {
    this.metrics.slowQueries.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Keep only last 100 entries
    if (this.metrics.slowQueries.length > this.maxStoredMetrics) {
      this.metrics.slowQueries.shift();
    }

    if (duration > 500) {
      console.warn(`⚠️ Slow query: ${name} took ${duration}ms`);
    }
  }

  logFailedQuery(name: string, error: string) {
    this.metrics.failedQueries.push({
      name,
      error,
      timestamp: Date.now(),
    });

    if (this.metrics.failedQueries.length > this.maxStoredMetrics) {
      this.metrics.failedQueries.shift();
    }

    console.error(`❌ Query failed: ${name}`, error);
  }

  logSlowRender(component: string, duration: number) {
    this.metrics.slowRenders.push({
      component,
      duration,
      timestamp: Date.now(),
    });

    if (this.metrics.slowRenders.length > this.maxStoredMetrics) {
      this.metrics.slowRenders.shift();
    }

    if (duration > 16) {
      console.warn(`⚠️ Slow render: ${component} took ${duration.toFixed(2)}ms`);
    }
  }

  getReport() {
    const report = {
      summary: {
        totalSlowQueries: this.metrics.slowQueries.length,
        totalFailedQueries: this.metrics.failedQueries.length,
        totalSlowRenders: this.metrics.slowRenders.length,
        averageQueryTime:
          this.metrics.slowQueries.reduce((sum, q) => sum + q.duration, 0) /
          (this.metrics.slowQueries.length || 1),
        averageRenderTime:
          this.metrics.slowRenders.reduce((sum, r) => sum + r.duration, 0) /
          (this.metrics.slowRenders.length || 1),
      },
      topSlowQueries: this.metrics.slowQueries
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
      recentFailures: this.metrics.failedQueries.slice(-10),
      topSlowRenders: this.metrics.slowRenders
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10),
    };

    return report;
  }

  clearMetrics() {
    this.metrics = {
      slowQueries: [],
      failedQueries: [],
      slowRenders: [],
    };
  }

  // Export to JSON for analysis
  exportMetrics() {
    const data = JSON.stringify(this.metrics, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Global instance
export const productionMonitor = new ProductionMonitor();

// Make available in console for debugging
if (typeof window !== 'undefined') {
  (window as any).productionMonitor = productionMonitor;
}

// Log instructions on load
console.log(`
🔍 Production Monitoring Active
═══════════════════════════════

Use these commands in the console:

  productionMonitor.getReport()     - View performance report
  productionMonitor.clearMetrics()  - Clear all metrics
  productionMonitor.exportMetrics() - Download metrics as JSON

Metrics being tracked:
  • Slow queries (>500ms)
  • Failed queries
  • Slow renders (>16ms)
`);
