import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { importFormsFreelancers } from '../lib/formsFreelancersImport.js'
import { error, json } from '../lib/response.js'

type ImportRequestBody = {
  fileName?: string
  csvText?: string
  csvBase64?: string
}

export async function importsFormsFreelancers(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as ImportRequestBody

    const fileName = body.fileName ?? null
    const csvText = typeof body.csvText === 'string' ? body.csvText : undefined
    const csvBase64 = typeof body.csvBase64 === 'string' ? body.csvBase64 : undefined

    if (!csvText && !csvBase64) {
      return error(400, 'csvText or csvBase64 is required')
    }

    const summary = await importFormsFreelancers({
      fileName: fileName ?? undefined,
      csvText,
      csvBase64,
    })

    return json(200, summary)
  } catch (err) {
    context.error(err)
    return error(
      500,
      'Failed to import forms freelancers CSV',
      err instanceof Error ? err.message : String(err),
    )
  }
}

app.http('imports-forms-freelancers', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'imports/forms-freelancers',
  handler: importsFormsFreelancers,
})
