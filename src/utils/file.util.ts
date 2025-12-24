import * as fs from 'fs/promises'
import * as path from 'path'

export class FileGenUtil {

    private fileContent: Map<string, string[]> = new Map()

    constructor(private outputDir: string) {}

    addLine(group: string, line: string) {
        if (!this.fileContent.has(group)) {
            this.fileContent.set(group, [])
        }
        this.fileContent.get(group)!.push(line + '\n')
    }

    async saveToFile(groups: string[], fileName: string) {
        let content = ''
        for (const group of groups) {
            const lines = this.fileContent.get(group)
            for (const line of lines || []) {
                content += line
            }
            content += '\n'
        }
        const filePath = path.join(this.outputDir, fileName);
        await fs.writeFile(filePath, content.trim())
    }
}

export async function ensureDirectoryExists(dirPath: string) {
    await fs.mkdir(dirPath, { recursive: true });
}