export function fixType(type: string): string {
    if (type === 'string') {
        return 'String'
    }
    if (type === 'number') {
        return 'Number'
    }
    return type
}

export function isPrimitive(type: string): boolean {
    return type === 'string' || type === 'number' || type === 'boolean' || type === 'object' || type === 'array'
}
