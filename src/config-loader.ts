// src/config-loader.ts
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { BffGenConfig } from './types';

export const loadConfig = (customPath?: string, rootDir?: string): BffGenConfig => {
  const configFileName = customPath || 'bff-gen-config.json';
  
  const fullPath = path.resolve(rootDir || process.cwd(), configFileName);

  console.log(chalk.gray(`🔍 Procurando configuração em: ${fullPath}`));

  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`❌ Arquivo de configuração não encontrado: ${configFileName}`));
    console.error(chalk.yellow(`   Certifique-se de criar o arquivo na raiz do projeto.`));
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const config = JSON.parse(fileContent) as BffGenConfig;
    
    if (!config.endpoints || !Array.isArray(config.endpoints)) {
        throw new Error("O campo 'endpoints' é obrigatório e deve ser um array.");
    }

    return config;
  } catch (error: any) {
    console.error(chalk.red(`❌ Erro ao ler o arquivo de configuração:`));
    console.error(error.message);
    process.exit(1);
  }
};