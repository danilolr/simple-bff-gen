// src/config-loader.ts
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { BffGenConfig } from './types';

export const loadConfig = (customPath?: string): BffGenConfig => {
  // 1. Determina o caminho do arquivo
  // Se o usuário passou um caminho, usa ele. Se não, procura o padrão na raiz.
  const configFileName = customPath || 'bff-gen-config.json';
  
  // process.cwd() pega a pasta onde o usuário rodou o comando (a raiz do projeto dele)
  const fullPath = path.resolve(process.cwd(), configFileName);

  console.log(chalk.gray(`🔍 Procurando configuração em: ${fullPath}`));

  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`❌ Arquivo de configuração não encontrado: ${configFileName}`));
    console.error(chalk.yellow(`   Certifique-se de criar o arquivo na raiz do projeto.`));
    process.exit(1);
  }

  try {
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const config = JSON.parse(fileContent) as BffGenConfig;
    
    // Opcional: Aqui você poderia validar se os campos obrigatórios existem
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