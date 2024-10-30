const logger = require('./logger');

class AppError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
    }
}

class ErrorHandler {
    static handle(error, context = '') {
        if (error instanceof AppError) {
            logger.error(`${context}: ${error.message}`, {
                code: error.code,
                details: error.details,
                timestamp: error.timestamp
            });
        } else {
            logger.error(`${context}: Unexpected error`, {
                message: error.message,
                stack: error.stack
            });
        }

        return {
            success: false,
            error: {
                message: error.message,
                code: error.code || 'UNKNOWN_ERROR'
            }
        };
    }

    static async wrapAsync(fn) {
        return async (...args) => {
            try {
                return await fn(...args);
            } catch (error) {
                return ErrorHandler.handle(error, fn.name);
            }
        };
    }
}

module.exports = {
    AppError,
    ErrorHandler
}; 