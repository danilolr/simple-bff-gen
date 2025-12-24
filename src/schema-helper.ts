import { OpenAPIV3, OpenAPIV2 } from 'openapi-types';

// Tipo unificado para facilitar o manuseio
type SchemaMap = OpenAPIV3.ComponentsObject['schemas'] | OpenAPIV2.DefinitionsObject;

export const getSchemas = (doc: any): SchemaMap => {
  // Verifica se é OpenAPI 3
  if (doc.components && doc.components.schemas) {
    return doc.components.schemas;
  }
  
  // Verifica se é Swagger 2 (fallback)
  if (doc.definitions) {
    return doc.definitions;
  }

  return {};
};