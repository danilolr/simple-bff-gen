import { OpenApiMetadata } from "./metadata"
import { FileGenUtil } from "./utils/file.util"

export function generateServiceUtil(baseDir: string, endpoint: { name: string; url: string; }, metadata: OpenApiMetadata) {
    const serviceUtilFile = new FileGenUtil(baseDir)
    serviceUtilFile.addLine('header', 'import { Injectable } from "@nestjs/common"\n')
    serviceUtilFile.addLine('header', '@Injectable()')
    serviceUtilFile.addLine('header', 'export class NeedleService {')
    serviceUtilFile.addLine('header', '    chamadaPost(url: string, arg1: {}): Promise<{ data: any; }> {')
    serviceUtilFile.addLine('header', '        throw new Error(\'Method not implemented.\');')
    serviceUtilFile.addLine('header', '    }')
    serviceUtilFile.addLine('header', '}')
    serviceUtilFile.saveToFile(['header'], 'needle.service.ts')
}
