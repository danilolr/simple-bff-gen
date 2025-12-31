import fs from 'fs'
import path from 'path'
import { BffGenConfig } from './types'
import { loadOpenApiSpec } from './open-api-loader'
import { FileGenUtil } from './utils/file.util'
import { OpenAPI } from 'openapi-types'
import { generateDto } from './generator.dto'
import { generateController } from './generator.controller'
import { createMetadata } from './metadata'
import { generateModule } from './generator.module'
import { generateServiceUtil } from './generator.service.util'

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
    const metadata = createMetadata(spec)
    if (!metadata) {
      console.log(`Nenhum metadado extraído para o endpoint: ${endpoint.name}`)
      continue;
    }
    console.log(`Metadados extraídos: ${JSON.stringify(metadata, null, 2)}`)

    const baseDir = `${rootDir}/src/bff-gen`
    await buildDirStructure(baseDir, config, spec)

    const file = new FileGenUtil(baseDir)
    file.saveToFile([], 'config.json')
    console.log(`Título da API: ${spec.info.title}`)

    generateDto(baseDir, endpoint, metadata!)
    generateController(baseDir, endpoint, metadata!)
    generateModule(baseDir, endpoint, metadata!)
    generateServiceUtil(baseDir, endpoint, metadata!)
  }
}

