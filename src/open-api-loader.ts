import SwaggerParser from '@apidevtools/swagger-parser'
import { OpenAPI } from 'openapi-types'
import chalk from 'chalk'

export const loadOpenApiSpec = async (urlOrPath: string): Promise<OpenAPI.Document> => {
  console.log(chalk.gray(`⏳ Baixando e parseando OpenAPI de: ${urlOrPath}...`));

  try {
    // .dereference() é mágico: ele baixa o JSON e substitui todos os $ref
    // pelos objetos reais. Isso facilita MUITO a geração de código.
    // const api = await SwaggerParser.dereference(urlOrPath);
    const api = await SwaggerParser.bundle(urlOrPath);
    
    console.log(chalk.green(`✅ OpenAPI Validado! Título: ${api.info.title}`));
    
    return api;
  } catch (err: any) {
    console.error(chalk.red('❌ Erro ao ler/validar o arquivo OpenAPI:'));
    console.error(err.message);
    process.exit(1);
  }
};