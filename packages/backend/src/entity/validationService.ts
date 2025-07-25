import partial from 'lodash.partial'
import { DidResolver } from '../did-resolver/did-resolver'
import { SchemaRepository } from '../schema/service'

export interface ValidationService {
  validateDids: (dids: string[]) => Promise<void>
  validateSchemas: (schemaIds: string[]) => Promise<void>
}

export async function createValidationService(
  schemaRepository: SchemaRepository,
  didResolver: DidResolver,
): Promise<ValidationService> {
  return {
    validateDids: partial(validateDids, didResolver),
    validateSchemas: partial(validateSchemas, schemaRepository),
  }
}

async function validateDids(didResolver: DidResolver, dids: string[]) {
  // Skip DID validation in development environment
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.SKIP_DID_VALIDATION === 'true'
  ) {
    console.log('Skipping DID validation in development environment')
    return
  }

  for (const did of dids) {
    const didDocument = await didResolver.resolveDid(did)
    if (!didDocument) {
      throw new Error(`DID ${did} is not resolvable`)
    }
  }
}

async function validateSchemas(
  schemaRepository: SchemaRepository,
  schemaIds: string[],
) {
  for (const schemaId of schemaIds) {
    const schema = await schemaRepository.findBySchemaId(schemaId)
    if (!schema) {
      throw new Error(
        `Schema ID '${schemaId}' is not present in the trust registry`,
      )
    }
  }
}
