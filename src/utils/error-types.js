class BaseError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

class ValidationError extends BaseError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
    }
}

class DatabaseError extends BaseError {
    constructor(message, details) {
        super(message, 'DATABASE_ERROR', details);
    }
}

class AuthenticationError extends BaseError {
    constructor(message, details) {
        super(message, 'AUTH_ERROR', details);
    }
}

class FileSystemError extends BaseError {
    constructor(message, details) {
        super(message, 'FS_ERROR', details);
    }
}

module.exports = {
    BaseError,
    ValidationError,
    DatabaseError,
    AuthenticationError,
    FileSystemError
}; 