import { OpenApiMetadata } from "./metadata";
import { FileGenUtil } from "./utils/file.util"
import { fixType } from "./utils/type.util";

export function generateDto(baseDir: string, endpoint: { name: string; url: string; }, metadata: OpenApiMetadata) {
    const dto = new FileGenUtil(baseDir + "/" + endpoint.name + "/dto")

    dto.addLine('header', 'import { ApiProperty } from \'@nestjs/swagger\'')

    for (const enumDef of metadata.enums) {
        dto.addLine('dto', `export enum ${enumDef.name} {`)
        for (const value of enumDef.values) {
            dto.addLine('dto', `  ${value},`)
        }
        dto.addLine('dto', `}\n`)
    }

    for (const schema of metadata.dtos) {
        console.log(`Gerando DTO: ${schema.name}`)

        dto.addLine('dto', `export class ${schema.name} {\n`)

        for (const prop of schema.properties) {
            let infoType = ''
            if (prop.isArray) {
                infoType = `{isArray: true, type: () => ${fixType(prop.type)}}`
            }
            dto.addLine('dto', `  @ApiProperty(${infoType})`)
            dto.addLine('dto', `  ${prop.name}: ${prop.type}\n`);
        }

        dto.addLine('dto', `}\n`);
    }

    dto.saveToFile(['header', 'dto'], endpoint.name + '.dto.ts')
}