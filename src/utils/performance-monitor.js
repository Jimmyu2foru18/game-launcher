const logger = require('./logger');

class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.startTimes = new Map();
    }

    startOperation(operationName) {
        this.startTimes.set(operationName, process.hrtime());
    }

    endOperation(operationName) {
        const startTime = this.startTimes.get(operationName);
        if (!startTime) return;

        const [seconds, nanoseconds] = process.hrtime(startTime);
        const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

        if (!this.metrics.has(operationName)) {
            this.metrics.set(operationName, {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                minTime: Infinity,
                maxTime: 0
            });
        }

        const metric = this.metrics.get(operationName);
        metric.count++;
        metric.totalTime += duration;
        metric.avgTime = metric.totalTime / metric.count;
        metric.minTime = Math.min(metric.minTime, duration);
        metric.maxTime = Math.max(metric.maxTime, duration);

        this.startTimes.delete(operationName);

        logger.debug('Operation performance', {
            operation: operationName,
            duration,
            metrics: metric
        });
    }

    getMetrics(operationName) {
        return operationName ? 
            this.metrics.get(operationName) : 
            Object.fromEntries(this.metrics);
    }

    reset() {
        this.metrics.clear();
        this.startTimes.clear();
    }
}

module.exports = new PerformanceMonitor(); 