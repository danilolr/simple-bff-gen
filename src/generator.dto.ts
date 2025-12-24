
// import { getSchemas } from "./schema-helper";
// import { FileGenUtil } from "./utils/file.util";

// const extractRefName = (ref: string) => ref.split('/').pop();

// export function generateDto(baseDir: string, endpoint: { name: string; url: string; }, spec: unknown) {
//     const dto = new FileGenUtil(baseDir + "/" + endpoint.name + "/dto")
//     const schemas = getSchemas(spec)

//     dto.addLine('header', 'import { ApiProperty } from \'@nestjs/swagger\'');

//     for (const [schemaName, schemaDef] of Object.entries(schemas || {})) {
//       dto.addLine('dto', `export class ${schemaName} {\n`);

//       const props = (schemaDef as any).properties;

//       if (props) {
//         for (const [propName, propDef] of Object.entries(props)) {
//             const p = propDef as any;

//             // Adiciona o decorator
//             dto.addLine('dto', '  @ApiProperty()');

//             let tsType = 'any'; // Default

//             // -------------------------------------------------
//             // CENÁRIO 1: É um ARRAY?
//             // -------------------------------------------------
//             if (p.type === 'array' && p.items) {
//                 // 1.1 Array de Referência (ex: Message[])
//                 if (p.items.$ref) {
//                     const refName = extractRefName(p.items.$ref);
//                     tsType = `${refName}[]`;
//                 } 
//                 // 1.2 Array de Primitivo (ex: number[])
//                 else {
//                     const itemType = p.items.type === 'integer' ? 'number' : (p.items.type || 'any');
//                     tsType = `${itemType}[]`;
//                 }
//             } 
//             // -------------------------------------------------
//             // CENÁRIO 2: É uma REFERÊNCIA DIRETA? (Objeto aninhado)
//             // -------------------------------------------------
//             // Ex: "advisor": { "$ref": "#/components/schemas/Advisor" }
//             else if (p.$ref) {
//                  tsType = extractRefName(p.$ref) as string;
//             }
//             // -------------------------------------------------
//             // CENÁRIO 3: É um ENUM? (Inline)
//             // -------------------------------------------------
//             // Se quiser tratar enum inline como string ou criar type separado
//             else if (p.enum) {
//                 // Simplificação: trata enum inline como união de strings
//                 // Ex: "GROQ" | "OLLAMA"
//                 tsType = p.enum.map((v: string) => `'${v}'`).join(' | ');
//             }
//             // -------------------------------------------------
//             // CENÁRIO 4: É um PRIMITIVO?
//             // -------------------------------------------------
//             else {
//                 tsType = p.type === 'integer' ? 'number' : (p.type || 'any');
//             }

//             // Escreve a linha final
//             dto.addLine('dto', `  ${propName}: ${tsType}\n`);
//         }
//       }
//       dto.addLine('dto', `}\n`);
//     }    

//     dto.saveToFile(['header', 'dto'], endpoint.name + '.dto.ts')
// }

import { getSchemas } from "./schema-helper";
import { FileGenUtil } from "./utils/file.util";

// Função auxiliar para extrair o nome da classe da string $ref
const extractRefName = (ref: string) => ref.split('/').pop();

export function generateDto(baseDir: string, endpoint: { name: string; url: string; }, spec: unknown) {
    const dto = new FileGenUtil(baseDir + "/" + endpoint.name + "/dto")
    const schemas = getSchemas(spec)

    dto.addLine('header', 'import { ApiProperty } from \'@nestjs/swagger\'');

    for (const [schemaName, schemaDef] of Object.entries(schemas || {})) {
        const def = schemaDef as any;

        // ============================================================
        // NOVA LÓGICA: Verifica se é um ENUM Top-Level antes de criar Classe
        // ============================================================
        if (def.enum) {
            dto.addLine('dto', `export enum ${schemaName} {`);

            def.enum.forEach((val: string | number) => {
                // Tratamento para garantir chaves válidas no TS
                // Se a string for "V8", a chave será V8.
                // Se tiver espaços ou caracteres especiais, removemos para a chave.
                let key = val.toString().replace(/[^a-zA-Z0-9_]/g, '_');

                // Evita chaves numéricas puras (ex: enum { 1 = 1 } é inválido como chave direta sem aspas)
                if (/^\d/.test(key)) {
                    key = `_${key}`;
                }

                const value = typeof val === 'string' ? `'${val}'` : val;

                dto.addLine('dto', `  ${key} = ${value},`);
            });

            dto.addLine('dto', `}\n`);

            // Pula para o próximo schema, pois este já foi gerado como Enum
            continue;
        }

        // ============================================================
        // LÓGICA EXISTENTE: Gera como CLASSE se não for Enum
        // ============================================================
        dto.addLine('dto', `export class ${schemaName} {\n`);

        const props = def.properties;

        if (props) {
            for (const [propName, propDef] of Object.entries(props)) {
                const p = propDef as any;
                let infoType = ''
                if (p.type === 'array' && p.items) {
                    if (p.items.$ref) {
                        const refName = extractRefName(p.items.$ref)
                        infoType = `{isArray: true, type: () => ${refName}}`
                    }
                    else {
                        const itemType = p.items.type === 'integer' ? 'number' : (p.items.type || 'any')
                        infoType = `{isArray: true, type: () => ${itemType}}`;
                    }
                }

                dto.addLine('dto', `  @ApiProperty(${infoType})`);

                let tsType = 'any';

                // CENÁRIO 1: ARRAY
                if (p.type === 'array' && p.items) {
                    if (p.items.$ref) {
                        const refName = extractRefName(p.items.$ref);
                        tsType = `${refName}[]`;
                    }
                    else {
                        const itemType = p.items.type === 'integer' ? 'number' : (p.items.type || 'any');
                        tsType = `${itemType}[]`;
                    }
                }
                // CENÁRIO 2: REFERÊNCIA DIRETA
                else if (p.$ref) {
                    tsType = extractRefName(p.$ref) as string;
                }
                // CENÁRIO 3: ENUM INLINE
                else if (p.enum) {
                    tsType = p.enum.map((v: string) => `'${v}'`).join(' | ');
                }
                // CENÁRIO 4: PRIMITIVO
                else {
                    tsType = p.type === 'integer' ? 'number' : (p.type || 'any');
                }

                dto.addLine('dto', `  ${propName}: ${tsType}\n`);
            }
        }
        dto.addLine('dto', `}\n`);
    }

    dto.saveToFile(['header', 'dto'], endpoint.name + '.dto.ts')
}