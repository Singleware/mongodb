"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Schemas_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const BSON = require("./bson");
/**
 * Mongo DB schemas class.
 */
let Schemas = Schemas_1 = class Schemas extends Class.Null {
    /**
     * Sets the specified target property if the source property has any data.
     * @param to Target property.
     * @param target Target entity.
     * @param from Source property.
     * @param source Source entity.
     */
    static setProperty(to, target, from, source) {
        if (source[from] !== void 0) {
            target[to] = source[from];
        }
    }
    /**
     * Sets the number range.
     * @param entity Target entity.
     * @param column Source column.
     */
    static setNumberRange(entity, column) {
        Schemas_1.setProperty('minimum', entity, 'minimum', column);
        Schemas_1.setProperty('maximum', entity, 'maximum', column);
    }
    /**
     * Sets the string range.
     * @param entity Target entity.
     * @param column Source column.
     */
    static setStringRange(entity, column) {
        Schemas_1.setProperty('minLength', entity, 'minimum', column);
        Schemas_1.setProperty('maxLength', entity, 'maximum', column);
    }
    /**
     * Sets the array range.
     * @param entity Target entity.
     * @param column Source column.
     */
    static setArrayRange(entity, column) {
        Schemas_1.setProperty('minItems', entity, 'minimum', column);
        Schemas_1.setProperty('maxItems', entity, 'maximum', column);
    }
    /**
     * Build a column schema entity based on the specified column schema.
     * @param column Column Schema.
     * @returns Return the generated column schema entity.
     * @throws Throws an error when the column type is unsupported.
     */
    static buildSchema(column) {
        const entity = { bsonType: [] };
        for (const type of column.types) {
            switch (type) {
                case Mapping.Format.ID:
                    entity.bsonType.push('objectId');
                    break;
                case Mapping.Format.NULL:
                    entity.bsonType.push('null');
                    break;
                case Mapping.Format.BINARY:
                    entity.bsonType.push('binData');
                    break;
                case Mapping.Format.BOOLEAN:
                    entity.bsonType.push('bool');
                    break;
                case Mapping.Format.INTEGER:
                    entity.bsonType.push('int');
                    Schemas_1.setNumberRange(entity, column);
                    break;
                case Mapping.Format.DECIMAL:
                    entity.bsonType.push('double');
                    Schemas_1.setNumberRange(entity, column);
                    break;
                case Mapping.Format.NUMBER:
                    entity.bsonType.push('number');
                    Schemas_1.setNumberRange(entity, column);
                    break;
                case Mapping.Format.STRING:
                    entity.bsonType.push('string');
                    Schemas_1.setStringRange(entity, column);
                    break;
                case Mapping.Format.ENUMERATION:
                    entity.bsonType.push('string');
                    entity.enum = column.values;
                    break;
                case Mapping.Format.PATTERN:
                    const pattern = column.pattern.toString();
                    entity.bsonType.push('string');
                    entity.pattern = pattern.substring(1, pattern.lastIndexOf('/'));
                    break;
                case Mapping.Format.TIMESTAMP:
                    entity.bsonType.push('timestamp');
                    break;
                case Mapping.Format.DATE:
                    entity.bsonType.push('date');
                    break;
                case Mapping.Format.ARRAY:
                    entity.bsonType.push('array');
                    Schemas_1.setArrayRange(entity, column);
                    Schemas_1.setProperty('uniqueItems', entity, 'unique', column);
                    switch (column.model) {
                        case Object:
                            entity.items = { bsonType: 'object' };
                            break;
                        case String:
                            entity.items = { bsonType: 'string' };
                            break;
                        case Number:
                            entity.items = { bsonType: 'number' };
                            break;
                        case Boolean:
                            entity.items = { bsonType: 'bool' };
                            break;
                        case Date:
                            entity.items = { bsonType: 'date' };
                            break;
                        case BSON.ObjectID:
                            entity.items = { bsonType: 'objectId' };
                            break;
                        default:
                            entity.items = Schemas_1.build(column.schema || {});
                    }
                    break;
                case Mapping.Format.MAP:
                    entity.bsonType.push('object');
                    switch (column.model) {
                        case Object:
                            entity.additionalProperties = true;
                            break;
                        case String:
                            entity.additionalProperties = { bsonType: 'string' };
                            break;
                        case Number:
                            entity.additionalProperties = { bsonType: 'number' };
                            break;
                        case Boolean:
                            entity.additionalProperties = { bsonType: 'bool' };
                            break;
                        case Date:
                            entity.additionalProperties = { bsonType: 'date' };
                            break;
                        case BSON.ObjectID:
                            entity.additionalProperties = { bsonType: 'objectId' };
                            break;
                        default:
                            entity.additionalProperties = Schemas_1.build(column.schema || {});
                    }
                    break;
                case Mapping.Format.OBJECT:
                    const result = Schemas_1.build(column.schema || {});
                    entity.bsonType.push('object');
                    entity.properties = result.properties;
                    entity.additionalProperties = false;
                    Schemas_1.setProperty('required', entity, 'required', result);
                    break;
                default:
                    throw new TypeError(`Unsupported column schema type '${type}'`);
            }
        }
        return entity;
    }
    /**
     * Build a schema entity based on the specified row schema.
     * @param row Row schema.
     * @returns Returns the generated schema entity.
     */
    static build(row) {
        const entity = {
            bsonType: 'object',
            required: [],
            properties: {},
            additionalProperties: false
        };
        for (const column in row) {
            const schema = row[column];
            const name = schema.alias || column;
            if (schema.required) {
                entity.required.push(name);
            }
            entity.properties[name] = Schemas_1.buildSchema(schema);
        }
        if (entity.required.length === 0) {
            delete entity.required;
        }
        return entity;
    }
};
__decorate([
    Class.Private()
], Schemas, "setProperty", null);
__decorate([
    Class.Private()
], Schemas, "setNumberRange", null);
__decorate([
    Class.Private()
], Schemas, "setStringRange", null);
__decorate([
    Class.Private()
], Schemas, "setArrayRange", null);
__decorate([
    Class.Private()
], Schemas, "buildSchema", null);
__decorate([
    Class.Public()
], Schemas, "build", null);
Schemas = Schemas_1 = __decorate([
    Class.Describe()
], Schemas);
exports.Schemas = Schemas;
