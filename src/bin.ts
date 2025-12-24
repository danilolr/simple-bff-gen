#!/usr/bin/env node

import { loadConfig } from './config-loader'
import chalk from 'chalk'
import { generateBffCode } from './generator'
import path from 'path'

var args = process.argv.slice(2)
args = args[0].split(" ")
let customConfigPath = args[0]
if (customConfigPath=="--debug") {
    customConfigPath = args[1]
}
let rootDir = path.dirname(customConfigPath)

console.log(chalk.blue.bold('🚀 Iniciando simple-bff-gen...'))

const config = loadConfig(customConfigPath, rootDir)

console.log(chalk.green(`✅ Configuração carregada! Processando ${config.endpoints.length} serviços...`))

generateBffCode(config, rootDir)

console.log(chalk.green(`✅ Código gerado para ${config.endpoints.length} serviços.`))