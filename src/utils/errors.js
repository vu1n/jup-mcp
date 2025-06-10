// Base API Error class
export class APIError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Validation Error class
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Not Found Error class
export class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Unauthorized Error class
export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Service Error class for jup.ag API errors
export class ServiceError extends APIError {
  constructor(message, status = 500) {
    super(message, status);
    this.name = 'ServiceError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
} 