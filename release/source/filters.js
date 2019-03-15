"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Filters_1;
"use strict";
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const BSON = require("./bson");
/**
 * Filters helper class.
 */
let Filters = Filters_1 = class Filters extends Class.Null {
    /**
     * Gets the corresponding schema from the specified model type and column name.
     * @param model Model type.
     * @param name Column name.
     * @returns Returns the column schema.
     * @throws Throws an error when te specified column does not exists.
     */
    static getSchema(model, name) {
        const schema = Mapping.Schema.getRealColumn(model, name);
        if (!schema) {
            throw new Error(`Column '${name}' does not exists.`);
        }
        return schema;
    }
    /**
     * Converts the specified input value to an ObjectID when possible.
     * @param value Input value.
     * @param schema Real column schema.
     * @returns Returns the original value or the converted value.
     */
    static castValue(value, schema) {
        if (schema.formats.includes(Mapping.Types.Format.ARRAY) && value instanceof Array && schema.model === BSON.ObjectID) {
            for (let i = 0; i < value.length; ++i) {
                if (BSON.ObjectID.isValid(value[i])) {
                    value[i] = new BSON.ObjectID(value[i]);
                }
            }
        }
        else if (schema.formats.includes(Mapping.Types.Format.ID) && (typeof value === 'string' || typeof value === 'number')) {
            if (BSON.ObjectID.isValid(value)) {
                value = new BSON.ObjectID(value);
            }
        }
        return value;
    }
    /**
     * Build a filter entity from the specified filter expression.
     * @param model Model type.
     * @param filter Filter expression.
     * @returns Returns the generated filter entity.
     * @throws Throws an error when there is a nonexistent column in the specified filter.
     */
    static build(model, filter) {
        const entity = {};
        for (const name in filter) {
            const operation = filter[name];
            const schema = Filters_1.getSchema(model, name);
            const column = schema.alias || schema.name;
            const value = Filters_1.castValue(operation.value, schema);
            switch (operation.operator) {
                case Mapping.Statements.Operator.REGEX:
                    entity[column] = { $regex: value };
                    break;
                case Mapping.Statements.Operator.LESS:
                    entity[column] = { $lt: value };
                    break;
                case Mapping.Statements.Operator.LESS_OR_EQUAL:
                    entity[column] = { $lte: value };
                    break;
                case Mapping.Statements.Operator.EQUAL:
                    entity[column] = { $eq: value };
                    break;
                case Mapping.Statements.Operator.NOT_EQUAL:
                    entity[column] = { $neq: value };
                    break;
                case Mapping.Statements.Operator.GREATER_OR_EQUAL:
                    entity[column] = { $gte: value };
                    break;
                case Mapping.Statements.Operator.GREATER:
                    entity[column] = { $gt: value };
                    break;
                case Mapping.Statements.Operator.BETWEEN:
                    entity[column] = { $gte: value[0], $lte: value[1] };
                    break;
                case Mapping.Statements.Operator.CONTAIN:
                    entity[column] = { $in: [...value] };
                    break;
                case Mapping.Statements.Operator.NOT_CONTAIN:
                    entity[column] = { $nin: [...value] };
                    break;
            }
        }
        return entity;
    }
};
__decorate([
    Class.Private()
], Filters, "getSchema", null);
__decorate([
    Class.Private()
], Filters, "castValue", null);
__decorate([
    Class.Public()
], Filters, "build", null);
Filters = Filters_1 = __decorate([
    Class.Describe()
], Filters);
exports.Filters = Filters;
