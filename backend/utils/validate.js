import { AppError } from './AppError.js';

/**
 * Validates one part of the request (body/params/query) against a zod schema and
 * exposes the parsed value on `req.validated[source]`. Controllers read from there
 * rather than from the raw input, so unknown fields are stripped and types are
 * coerced exactly once, at the boundary.
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.') || source,
      message: issue.message,
    }));
    return next(new AppError(400, 'VALIDATION_ERROR', 'Request validation failed', details));
  }

  req.validated = { ...(req.validated ?? {}), [source]: result.data };
  return next();
};

export default validate;
