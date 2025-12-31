import { OpenAPI } from "openapi-types";
import { FileGenUtil } from "./utils/file.util"
import { OpenApiMetadata } from "./metadata"
import { fileName } from "./utils/generic.util"
import { fixType } from "./utils/type.util";

export function generateController(baseDir: string, endpoint: { name: string; url: string; }, metadata: OpenApiMetadata) {
    const dontRepeat = new DontRepeat()
    for (const controller of metadata.controllers) {
        console.log(`Gerando controller: ${controller.name}`)
        const fileController = new FileGenUtil(baseDir + "/" + endpoint.name + "/controllers")

        fileController.addLine('header', "import { Body, Controller, Post, Get, Delete, Put } from '@nestjs/common'")
        fileController.addLine('header', "import { ApiResponse, ApiTags } from '@nestjs/swagger'")
        fileController.addLine('header', "import { NeedleService } from '../../needle.service'")

        fileController.addLine('class', "@Controller()")
        fileController.addLine('class', `export class ${controller.name} {`)
        fileController.addLine('class', `\n    constructor(private readonly needleService: NeedleService) {}`)
        const quote = '`'
        for (const method of controller.methods) {
            const envName = '${' + `process.env.${endpoint.name.toUpperCase()}_URL` + '}'

            dontRepeat.add(method.returnTypes[0].type)

            let typeAnnotation = methodTypeAnnotation(method.httpMethod)
            fileController.addLine('class', `\n    @${typeAnnotation}('${method.route}')`)
            fileController.addLine('class', `    @ApiTags('${endpoint.name}-${method.tags[0]}')`)
            fileController.addLine('class', "    @ApiResponse({")
            fileController.addLine('class', `        status: ${method.returnTypes[0].code},`)
            fileController.addLine('class', `        description: "${method.returnTypes[0].description}",`)
            fileController.addLine('class', `        type: ${fixType(method.returnTypes[0].type)},`)
            fileController.addLine('class', `        isArray: ${method.returnTypes[0].isArray},`)
            fileController.addLine('class', "    })")
            fileController.addLine('class', `    async ${method.name}(): Promise<${method.returnTypes[0].type}>     {    `)
            fileController.addLine('class', `        var url = ${quote}${envName}${method.route}${quote}`)
            fileController.addLine('class', `        var resp = await this.needleService.chamadaPost(url, {`)
            fileController.addLine('class', `        })`)
            fileController.addLine('class', `        return resp.data`)
            fileController.addLine('class', "    }")
        }

        fileController.addLine('class', "}")

        for (const type of dontRepeat.name) {
            if (type == 'string' || type == "number") continue;
            fileController.addLine('imports', `import { ${type} } from "../dto/${endpoint.name}.dto"`)
        }
        fileController.saveToFile(['header', 'imports', 'class'], fileName(controller.name) + '.ts')
    }
}

function filterMethodsByControllerAndTag(spec: OpenAPI.Document<{}>, name: string, tag: string) {
    let results: any[] = []
    if (spec.paths) {
        for (const [route, methods] of Object.entries(spec.paths)) {
            if (!methods) continue;

            for (const [method, op] of Object.entries(methods)) {
                if (!op) continue;
                let operation = op! as any;
                let controllerName = operation!.operationId.substring(0, operation!.operationId.indexOf('_'))
                if (controllerName === name && operation.tags && operation.tags.includes(tag)) {
                    results.push({
                        route,
                        method,
                        operation
                    })
                }
            }
        }
    }
    return results
}

function methodTypeAnnotation(httpMethod: string): string {
    switch (httpMethod.toLowerCase()) {
        case 'get':
            return 'Get';
        case 'post':
            return 'Post';
        case 'put':
            return 'Put';
        case 'delete':
            return 'Delete';
        case 'patch':
            return 'Patch';
        default:
            return 'Post'; // Default para Post se o método for desconhecido
    }
}

export class DontRepeat {
    public name = new Set<string>()

    public add(name: string) {
        if (this.name.has(name)) {
            return
        }
        this.name.add(name)
    }
}