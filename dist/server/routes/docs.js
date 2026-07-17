import { Router } from "express";
const docsRouter = Router();
const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "UPRISE API Gateway",
        version: "1.0.0",
        description: "Enterprise CMS, CRM, and media storage gateway APIs."
    },
    servers: [
        { url: "", description: "API root proxy" }
    ],
    paths: {
        "/api/csrf": {
            get: {
                summary: "Retrieve CSRF Token",
                description: "Returns double-submit cookie x-csrf-token value for authentication state validation.",
                responses: {
                    200: {
                        description: "CSRF token generated successfully."
                    }
                }
            }
        },
        "/api/auth/login": {
            post: {
                summary: "Administrator Authentication",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    email: { type: "string", format: "email" },
                                    password: { type: "string" }
                                },
                                required: ["email", "password"]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Session created successfully." }
                }
            }
        },
        "/api/contact": {
            post: {
                summary: "Inquiry Submission",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    email: { type: "string", format: "email" },
                                    phone: { type: "string" },
                                    company: { type: "string" },
                                    interest: { type: "string" },
                                    message: { type: "string" },
                                    consent: { type: "boolean" }
                                },
                                required: ["name", "email", "interest", "message", "consent"]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Message logged and Lead created." }
                }
            }
        },
        "/api/admin/dashboard": {
            get: {
                summary: "Dashboard Statistics",
                description: "Protected route returning entity database records count metrics.",
                responses: {
                    200: { description: "Stats object returned." }
                }
            }
        },
        "/api/admin/leads": {
            get: {
                summary: "Lead Lists",
                responses: {
                    200: { description: "Paginated list of leads." }
                }
            }
        },
        "/api/admin/services": {
            get: {
                summary: "CMS Services list",
                responses: {
                    200: { description: "List of platform services." }
                }
            }
        }
    }
};
docsRouter.get("/swagger.json", (_req, res) => {
    res.json(openApiSpec);
});
docsRouter.get("/", (_req, res) => {
    const swaggerHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>UPRISE API Reference</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" charset="UTF-8"></script>
      <script>
        window.onload = () => {
          window.ui = SwaggerUIBundle({
            url: '/api/docs/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis
            ],
            layout: "BaseLayout"
          });
        };
      </script>
    </body>
    </html>
  `;
    res.type("text/html").send(swaggerHtml);
});
export { docsRouter };
