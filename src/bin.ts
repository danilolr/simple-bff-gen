#!/usr/bin/env node

import { loadConfig } from './config-loader'
import chalk from 'chalk'
import { generateBffCode } from './generator'

const args = process.argv.slice(2);
const customConfigPath = args[0]; 

console.log(chalk.blue.bold('🚀 Iniciando simple-bff-gen...'))

const config = loadConfig(customConfigPath)

console.log(chalk.green(`✅ Configuração carregada! Processando ${config.endpoints.length} serviços...`))

generateBffCode(config)