import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { Context } from './context'

export function generateSwaggerDocs(context: Context) {
  const registry = new OpenAPIRegistry()

  registry.registerPath({
    method: 'get',
    path: '/health',
    summary: 'Healthcheck endpoint',
    request: {},
    responses: {
      200: {
        description: 'OK',
        content: {
          'application/text': {
            schema: z.string(),
          },
        },
      },
    },
  })

  context.registryController
    .getRouteConfigDocs()
    .forEach((route) => registry.registerPath(route))

  context.submissionController
    .getRouteConfigDocs()
    .forEach((route) => registry.registerPath(route))

  context.authController
    .getRouteConfigDocs()
    .forEach((route) => registry.registerPath(route))

  const generator = new OpenApiGeneratorV3(registry.definitions)

  const doc = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Trust Registry',
      description:
        '[http://localhost:3000/api/docs-json](http://localhost:3000/api/docs-json)',
    },
    servers: [{ url: '/api' }],
  })

  return doc
}
