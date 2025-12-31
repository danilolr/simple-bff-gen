import { DtoDef, OpenApiMetadata } from "./metadata"
import { FileGenUtil } from "./utils/file.util"
import { fixType, isPrimitive } from "./utils/type.util"


function generateDtoClass(schema: DtoDef, dto: FileGenUtil, dependencies: Map<string, string[]>) {
    console.log(`Gerando DTO: ${schema.name}`)

    dto.addLine('dto', `export class ${schema.name} {\n`)

    for (const prop of schema.properties) {
        let infoType = ''
        if (prop.isArray) {
            infoType = `{isArray: true, type: () => ${fixType(prop.type)}}`
        }
        dto.addLine('dto', `  @ApiProperty(${infoType})`)
        dto.addLine('dto', `  ${prop.name}: ${prop.type}${prop.isArray ? '[]' : ''}\n`);
    }

    dto.addLine('dto', `}\n`);
}

export function generateDto(baseDir: string, endpoint: { name: string; url: string; }, metadata: OpenApiMetadata) {
    const dtoFile = new FileGenUtil(baseDir + "/" + endpoint.name + "/dto")

    var dependencies = new Map<string, string[]>()

    dtoFile.addLine('header', 'import { ApiProperty } from \'@nestjs/swagger\'')

    for (const enumDef of metadata.enums) {
        dtoFile.addLine('dto', `export enum ${enumDef.name} {`)
        for (const value of enumDef.values) {
            dtoFile.addLine('dto', `  ${value},`)
        }
        dtoFile.addLine('dto', `}\n`)
    }

    for (const dto of metadata.dtos) {
        for (const prop of dto.properties) {
            if (!isPrimitive(prop.type)) {
                dependencies.get(dto.name)!.push(prop.type)
            }
        }
    }

    for (const dto of metadata.dtos) {
        generateDtoClass(dto, dtoFile, dependencies)
    }

    dtoFile.saveToFile(['header', 'dto'], endpoint.name + '.dto.ts')
}