export function fixType(type: string): string {
    if (type === 'string') {
        return 'String'
    }
    if (type === 'number') {
        return 'Number'
    }
    return type
}