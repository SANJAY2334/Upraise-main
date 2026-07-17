import { ValidationError } from "../shared/errors.js";
export function validate(schemas) {
    return (req, _res, next) => {
        try {
            // Validate Body
            if (schemas.body) {
                const parsed = schemas.body.safeParse(req.body);
                if (!parsed.success) {
                    throw new ValidationError("Invalid request body.", parsed.error.format());
                }
                req.body = parsed.data;
            }
            // Validate Query
            if (schemas.query) {
                const parsed = schemas.query.safeParse(req.query);
                if (!parsed.success) {
                    throw new ValidationError("Invalid query parameters.", parsed.error.format());
                }
                Object.assign(req.query, parsed.data);
            }
            // Validate Params
            if (schemas.params) {
                const parsed = schemas.params.safeParse(req.params);
                if (!parsed.success) {
                    throw new ValidationError("Invalid path parameters.", parsed.error.format());
                }
                Object.assign(req.params, parsed.data);
            }
            // Validate Headers
            if (schemas.headers) {
                const parsed = schemas.headers.safeParse(req.headers);
                if (!parsed.success) {
                    throw new ValidationError("Invalid request headers.", parsed.error.format());
                }
            }
            // Validate Cookies
            if (schemas.cookies) {
                const parsed = schemas.cookies.safeParse(req.cookies);
                if (!parsed.success) {
                    throw new ValidationError("Invalid cookies payload.", parsed.error.format());
                }
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
}
export function validateBody(schema) {
    return validate({ body: schema });
}
export function validateQuery(schema) {
    return validate({ query: schema });
}
export function validateParams(schema) {
    return validate({ params: schema });
}
