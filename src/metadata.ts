import { OpenAPI } from "openapi-types"

const extractRefName = (ref: string) => ref.split('/').pop()

export interface ParamInfo {
    name: string
    type: string
    in: string
    required: boolean
    description?: string
}

export interface ReturnTypeMetadata {
    code: number
    type: string
    isArray: boolean
    description?: string
}

export interface MethodMetadata {
    name: string
    httpMethod: string
    route: string
    tags: string[]
    parameters: ParamInfo[]
    returnTypes: ReturnTypeMetadata[]
}

export interface ControllerMetadata {
    name: string
    methods: MethodMetadata[]
}

export interface PropertyDef {
    name: string
    type: string
    isArray: boolean
}

export interface DtoDef {
    name: string
    properties: PropertyDef[]
}

export interface EnumDef {
    name: string
    values: string[]
}

export interface OpenApiMetadata {
    controllers: ControllerMetadata[]
    dtos: DtoDef[]
    enums: EnumDef[]
}

export function createMetadata(spec: OpenAPI.Document): OpenApiMetadata | undefined {
    let controllers: ControllerMetadata[] = []
    if (spec.paths) {
        for (const [route, methods] of Object.entries(spec.paths)) {
            if (!methods) continue;

            for (const [httpMethod, op] of Object.entries(methods)) {
                if (!op) continue;
                let operation = op! as any;
                let controllerName = operation!.operationId.substring(0, operation!.operationId.indexOf('_'))
                if (!controllerName) {
                    controllerName = "DefaultController"
                }
                let existing = controllers.find(c => c.name === controllerName)
                if (!existing) {
                    existing = { name: controllerName, methods: [] }
                    controllers.push(existing)
                }
                let methodName = operation!.operationId.substring(operation!.operationId.indexOf('_') + 1)
                // Extract return types from responses
                let returnTypes: ReturnTypeMetadata[] = []
                if (operation.responses) {
                    for (const [code, response] of Object.entries(operation.responses)) {
                        const resp = response as any
                        if (!resp) continue

                        let type = 'void'
                        let isArray = false

                        // Check if response has content
                        if (resp.content && resp.content['application/json']) {
                            const schema = resp.content['application/json'].schema

                            if (schema) {
                                if (schema.type === 'array') {
                                    isArray = true
                                    if (schema.items?.$ref) {
                                        type = extractRefName(schema.items.$ref) || 'any'
                                    } else if (schema.items?.type) {
                                        type = schema.items.type
                                    } else {
                                        type = 'any'
                                    }
                                } else if (schema.$ref) {
                                    type = extractRefName(schema.$ref) || 'any'
                                } else if (schema.type) {
                                    type = schema.type
                                }
                            }
                        }

                        returnTypes.push({
                            code: parseInt(code),
                            type: type,
                            isArray: isArray,
                            description: resp.description
                        })
                    }
                }

                // Extract parameters
                let parameters: ParamInfo[] = []
                if (operation.parameters && Array.isArray(operation.parameters)) {
                    for (const param of operation.parameters) {
                        const p = param as any
                        if (!p) continue

                        let type = 'any'

                        // Extract type from schema
                        if (p.schema) {
                            if (p.schema.type === 'array') {
                                if (p.schema.items?.$ref) {
                                    type = extractRefName(p.schema.items.$ref) + '[]' || 'any[]'
                                } else if (p.schema.items?.type) {
                                    type = p.schema.items.type + '[]'
                                } else {
                                    type = 'any[]'
                                }
                            } else if (p.schema.$ref) {
                                type = extractRefName(p.schema.$ref) || 'any'
                            } else if (p.schema.type) {
                                type = p.schema.type
                            }
                        }

                        parameters.push({
                            name: p.name || 'unknown',
                            type: type,
                            in: p.in || 'query',
                            required: p.required || false,
                            description: p.description
                        })
                    }
                }

                // Also check for requestBody
                if (operation.requestBody) {
                    const reqBody = operation.requestBody as any
                    if (reqBody.content && reqBody.content['application/json']) {
                        const schema = reqBody.content['application/json'].schema
                        let type = 'any'

                        if (schema) {
                            if (schema.type === 'array') {
                                if (schema.items?.$ref) {
                                    type = extractRefName(schema.items.$ref) + '[]' || 'any[]'
                                } else if (schema.items?.type) {
                                    type = schema.items.type + '[]'
                                } else {
                                    type = 'any[]'
                                }
                            } else if (schema.$ref) {
                                type = extractRefName(schema.$ref) || 'any'
                            } else if (schema.type) {
                                type = schema.type
                            }
                        }

                        parameters.push({
                            name: 'body',
                            type: type,
                            in: 'body',
                            required: reqBody.required || false,
                            description: reqBody.description
                        })
                    }
                }

                let methodInfo = {
                    name: methodName,
                    httpMethod: httpMethod,
                    route: route,
                    tags: operation.tags || [],
                    parameters: parameters,
                    returnTypes: returnTypes
                }
                existing.methods.push(methodInfo)
            }
        }

        let dtos: DtoDef[] = []

        const doc = spec as any
        if (doc.components && doc.components.schemas) {
            for (const [name, schema] of Object.entries(doc.components.schemas)) {
                const s = schema as any
                if (s.enum) continue;

                let schemaDef: DtoDef = {
                    name: name,
                    properties: []
                }

                if (s.properties) {
                    for (const [propName, propSchema] of Object.entries(s.properties)) {
                        const p = propSchema as any
                        let type = p.type
                        let isArray = false
                        if (type === 'array') {
                            isArray = true
                            if (p.items.$ref) {
                                type = extractRefName(p.items.$ref)
                            } else {
                                type = p.items.type
                            }
                        } else if (p.$ref) {
                            type = extractRefName(p.$ref)
                        }

                        schemaDef.properties.push({
                            name: propName,
                            type: type || 'any',
                            isArray: isArray
                        })
                    }
                }
                dtos.push(schemaDef)
            }
        }

        let enums: EnumDef[] = []

        if (doc.components && doc.components.schemas) {
            for (const [name, schema] of Object.entries(doc.components.schemas)) {
                const s = schema as any
                if (s.enum) {
                    enums.push({
                        name: name,
                        values: s.enum
                    })
                }
            }
        }

        return {
            controllers: controllers,
            dtos: dtos,
            enums: enums,
        }
    }
}