"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Schemas_1;
Object.defineProperty(exports, "__esModule", { value: true });
"use strict";
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const BSON = require("./bson");
/**
 * MongoDb schemas class.
 */
let Schemas = Schemas_1 = class Schemas extends Class.Null {
    /**
     * Sets the specified target property if the specified source property has some data.
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
     * Build a new document schema based on the model in the specified column schema.
     * @param column Column schema.
     * @returns Returns the new document schema.
     */
    static buildDocumentSchema(column) {
        if (column.model && Mapping.Schema.isEntity(column.model)) {
            return Schemas_1.build(Mapping.Schema.getRealRow(column.model));
        }
        else {
            return Schemas_1.build({});
        }
    }
    /**
     * Build a new property schema based on the specified column schema.
     * @param column Column Schema.
     * @returns Return the generated schema properties.
     * @throws Throws an error when the column type is unsupported.
     */
    static buildPropertySchema(column) {
        const entity = { bsonType: [] };
        for (const type of column.formats) {
            switch (type) {
                case Mapping.Types.Format.ID:
                    entity.bsonType.push('objectId');
                    break;
                case Mapping.Types.Format.NULL:
                    entity.bsonType.push('null');
                    break;
                case Mapping.Types.Format.BINARY:
                    entity.bsonType.push('binData');
                    break;
                case Mapping.Types.Format.BOOLEAN:
                    entity.bsonType.push('bool');
                    break;
                case Mapping.Types.Format.INTEGER:
                    entity.bsonType.push('int');
                    Schemas_1.setProperty('minimum', entity, 'minimum', column);
                    Schemas_1.setProperty('maximum', entity, 'maximum', column);
                    break;
                case Mapping.Types.Format.DECIMAL:
                    entity.bsonType.push('double');
                    Schemas_1.setProperty('minimum', entity, 'minimum', column);
                    Schemas_1.setProperty('maximum', entity, 'maximum', column);
                    break;
                case Mapping.Types.Format.NUMBER:
                    entity.bsonType.push('number');
                    Schemas_1.setProperty('minimum', entity, 'minimum', column);
                    Schemas_1.setProperty('maximum', entity, 'maximum', column);
                    break;
                case Mapping.Types.Format.STRING:
                    entity.bsonType.push('string');
                    Schemas_1.setProperty('minLength', entity, 'minimum', column);
                    Schemas_1.setProperty('maxLength', entity, 'maximum', column);
                    break;
                case Mapping.Types.Format.ENUMERATION:
                    entity.bsonType.push('string');
                    entity.enum = column.values;
                    break;
                case Mapping.Types.Format.PATTERN:
                    const pattern = column.pattern.toString();
                    entity.bsonType.push('string');
                    entity.pattern = pattern.substring(1, pattern.lastIndexOf('/'));
                    break;
                case Mapping.Types.Format.TIMESTAMP:
                    entity.bsonType.push('timestamp');
                    break;
                case Mapping.Types.Format.DATE:
                    entity.bsonType.push('date');
                    break;
                case Mapping.Types.Format.ARRAY:
                    entity.bsonType.push('array');
                    Schemas_1.setProperty('minItems', entity, 'minimum', column);
                    Schemas_1.setProperty('maxItems', entity, 'maximum', column);
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
                            entity.items = this.buildDocumentSchema(column);
                    }
                    break;
                case Mapping.Types.Format.MAP:
                    entity.bsonType.push('object');
                    switch (column.model) {
                        case Object:
                            entity.additionalProperties = { bsonType: 'object' };
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
                            entity.additionalProperties = this.buildDocumentSchema(column);
                    }
                    break;
                case Mapping.Types.Format.OBJECT:
                    entity.bsonType.push('object');
                    if (column.model === Object) {
                        entity.additionalProperties = true;
                    }
                    else {
                        const result = this.buildDocumentSchema(column);
                        entity.properties = result.properties;
                        entity.additionalProperties = false;
                        Schemas_1.setProperty('required', entity, 'required', result);
                    }
                    break;
                default:
                    throw new TypeError(`Unsupported column schema type '${type}'`);
            }
        }
        return entity;
    }
    /**
     * Build a new entity schema based on the specified row schema.
     * @param row Row schema.
     * @returns Returns the generated schema entity.
     */
    static build(row) {
        const entity = {
            bsonType: 'object',
            properties: {},
            additionalProperties: false
        };
        for (const column in row) {
            const schema = row[column];
            const name = schema.alias || schema.name;
            if (schema.required) {
                if (entity.required === void 0) {
                    entity.required = [name];
                }
                else {
                    entity.required.push(name);
                }
            }
            entity.properties[name] = Schemas_1.buildPropertySchema(schema);
        }
        return entity;
    }
};
__decorate([
    Class.Private()
], Schemas, "setProperty", null);
__decorate([
    Class.Private()
], Schemas, "buildDocumentSchema", null);
__decorate([
    Class.Private()
], Schemas, "buildPropertySchema", null);
__decorate([
    Class.Public()
], Schemas, "build", null);
Schemas = Schemas_1 = __decorate([
    Class.Describe()
], Schemas);
exports.Schemas = Schemas;
//# sourceMappingURL=schemas.js.map