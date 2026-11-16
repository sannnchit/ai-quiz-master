import { AppError } from '../utils/AppError.js';

export const notFound = (req, res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', `Route not found - ${req.originalUrl}`));
};

/**
 * Single place that turns any thrown error into `{ error: { code, message, details } }`
 * so clients only ever branch on one shape.
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode ?? (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  // Only our own operational errors carry a meaningful code; a raw Node error's
  // `code` (e.g. ECONNREFUSED) must not be presented as a client contract.
  let code = err.isOperational && typeof err.code === 'string' ? err.code : 'INTERNAL_ERROR';
  let message = err.message || 'Something went wrong';
  let details = err.details;

  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER';
    message = `Invalid value for ${err.path}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = Object.values(err.errors).map((fieldError) => ({
      path: fieldError.path,
      message: fieldError.message,
    }));
  } else if (err.code === 11000) {
    // Mongo duplicate key. `err.code` is a number here, so it can't collide with
    // our own string codes above.
    statusCode = 409;
    code = 'DUPLICATE_KEY';
    message = 'A record with those details already exists';
    details = err.keyValue
      ? [{ path: Object.keys(err.keyValue)[0], message: 'Already in use' }]
      : undefined;
  }

  if (statusCode >= 500) {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(process.env.NODE_ENV === 'production' ? {} : { stack: err.stack }),
    },
  });
};
