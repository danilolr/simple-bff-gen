import fs from 'fs'
import path from 'path'
import { BffGenConfig } from './types'
import { loadOpenApiSpec } from './open-api-loader'
import { FileGenUtil } from './utils/file.util';
import { OpenAPI } from 'openapi-types';
import { getSchemas } from './schema-helper';
import { generateDto } from './generator.dto';

async function buildDirStructure(baseDir: string, config: BffGenConfig, spec: OpenAPI.Document) {
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  for (const endpoint of config.endpoints) {
    const endpointDir = path.join(baseDir, endpoint.name);
    if (!fs.existsSync(endpointDir)) {
      fs.mkdirSync(endpointDir, { recursive: true });
    }
    fs.mkdirSync(endpointDir + "/dto", { recursive: true });
    fs.mkdirSync(endpointDir + "/controllers", { recursive: true });
  }
}

export async function generateBffCode(config: BffGenConfig, rootDir: string) {
  for (let endpoint of config.endpoints) {
    console.log(`Gerando código para endpoint: ${endpoint.name} (${endpoint.url})`)
    const spec = await loadOpenApiSpec(endpoint.url)

    const baseDir = `${rootDir}/src/bff-gen`
    await buildDirStructure(baseDir, config, spec)

    const file = new FileGenUtil(baseDir)
    file.saveToFile([], 'config.json')
    console.log(`Título da API: ${spec.info.title}`)
    const readme = new FileGenUtil(baseDir + "/" + endpoint.name,)
    if (spec.paths) {
      for (const [route, methods] of Object.entries(spec.paths)) {
        if (!methods) continue;

        // Itera sobre os métodos (get, post, put...)
        for (const [method, operation] of Object.entries(methods)) {
          // Aqui você tem acesso a:
          // operation.operationId (ex: getUserById)
          // operation.parameters (inputs)
          // operation.responses (outputs)

          const opId = (operation as any).operationId || `${method}${route.replace(/\//g, '_')}`;

          readme.addLine('readme', `
// Rota: ${method.toUpperCase()} ${route}
// Descrição: ${(operation as any).summary || ''}
export const ${opId} = async (params) => {
  // Sua lógica de geração de BFF aqui...
  // Ex: return axios.${method}('${route}', params);
};`)
        }
      }
    }
    readme.saveToFile(['readme'], 'README.md')

    generateDto(baseDir, endpoint, spec)    
  }
}

