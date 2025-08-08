const express = require('express');
const promClient = require('prom-client');
const register = new promClient.Registry();

// Create metrics
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
});

const totalRequests = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new promClient.Gauge({
  name: 'websocket_connections_active',
  help: 'Number of active WebSocket connections',
});

const s3OperationsTotal = new promClient.Counter({
  name: 's3_operations_total',
  help: 'Total number of S3 operations',
  labelNames: ['operation', 'bucket', 'status'],
});

const mongodbOperationsTotal = new promClient.Counter({
  name: 'mongodb_operations_total',
  help: 'Total number of MongoDB operations',
  labelNames: ['operation', 'collection', 'status'],
});

// Register metrics
register.registerMetric(httpRequestDurationMicroseconds);
register.registerMetric(totalRequests);
register.registerMetric(activeConnections);
register.registerMetric(s3OperationsTotal);
register.registerMetric(mongodbOperationsTotal);

// Create monitoring middleware
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);

    totalRequests
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .inc();
  });

  next();
};

module.exports = {
  register,
  monitoringMiddleware,
  metrics: {
    activeConnections,
    s3OperationsTotal,
    mongodbOperationsTotal,
  },
};
