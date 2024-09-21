const winston = require('winston');
const { format, transports } = winston;

// Define a custom format for logs
const customFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }), // Include stack trace for errors
  format.splat(),
  format.json()
);

// Create the logger instance
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: customFormat,
  transports: [
    // Console transport for development environment
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple() // Use simple format for console
      )
    }),
    // File transport for general logs
    new transports.File({
      filename: 'combined.log',
      format: customFormat
    }),
    // File transport for error logs
    new transports.File({
      filename: 'errors.log',
      level: 'error', // Only log errors to this file
      format: customFormat
    })
  ],
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1); // Exit process after logging the uncaught exception
});

module.exports = logger;
