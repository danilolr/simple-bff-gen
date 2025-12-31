import { OpenApiMetadata } from "./metadata"
import { FileGenUtil } from "./utils/file.util"
import { controllerName, fileName } from "./utils/generic.util"

export function generateModule(baseDir: string, endpoint: { name: string; url: string; }, metadata: OpenApiMetadata) {
    const module = new FileGenUtil(baseDir + "/" + endpoint.name)
    module.addLine('module', 'import { Module } from "@nestjs/common"')
    module.addLine('module', 'import { NeedleService } from "../needle.service"')
    for (const controller of metadata.controllers) {
        module.addLine('module', 'import { ' + controller.name + ' } from "./controllers/' + fileName(controller.name) + '"')
    }

    let controllersNames = metadata.controllers.map(c => c.name)
    module.addLine('module', '\n@Module({')
    module.addLine('module', '  exports: [ NeedleService ],')
    module.addLine('module', '  imports: [],')
    module.addLine('module', '  providers: [ NeedleService ],')
    module.addLine('module', '  controllers: [ ' + controllersNames.join(', ') + '],')
    module.addLine('module', '})')
    module.addLine('module', 'export class ' + controllerName(endpoint.name) + 'Module {}')
    module.saveToFile(['module'], fileName(endpoint.name) + '.module.ts')
}
