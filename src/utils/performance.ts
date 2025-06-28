// Performance monitoring utilities

interface PerformanceMetrics {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Start timing a performance metric
   */
  start(name: string): void {
    if (!this.isDevelopment) return;

    const startTime = performance.now();
    this.metrics.set(name, { name, startTime });
  }

  /**
   * End timing a performance metric and log the result
   */
  end(name: string): number | null {
    if (!this.isDevelopment) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // eslint-disable-next-line no-console
    console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);

    return duration;
  }

  /**
   * Measure a function execution time
   */
  measure<T>(name: string, fn: () => T): T {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }

  /**
   * Measure an async function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.start(name);
    try {
      const result = await fn();
      this.end(name);
      return result;
    } catch (error) {
      this.end(name);
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }
}

// Export singleton instance
export const perf = new PerformanceMonitor();

// Memory usage monitoring
export const getMemoryUsage = (): string => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const used = Math.round((memory.usedJSHeapSize / 1048576) * 100) / 100;
    const total = Math.round((memory.totalJSHeapSize / 1048576) * 100) / 100;
    return `Memory: ${used}MB / ${total}MB`;
  }
  return 'Memory info not available';
};

// FPS monitoring
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();

  update(): number {
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.frames.push(1000 / delta);

    // Keep only last 60 frames
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    return this.getAverageFPS();
  }

  getAverageFPS(): number {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.frames.length);
  }

  reset(): void {
    this.frames = [];
    this.lastTime = performance.now();
  }
}

export const fps = new FPSMonitor();
