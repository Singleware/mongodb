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
     * Converts the specified input array to an array of ObjectID when possible.
     * @param input Input array.
     * @param schema Real column schema.
     * @returns Returns the original array or the converted array.
     */
    static castArray(input, schema) {
        if (schema.formats.includes(Mapping.Types.Format.ARRAY) && schema.model === BSON.ObjectID) {
            const list = [];
            for (const value of input) {
                if (BSON.ObjectID.isValid(value)) {
                    list.push(new BSON.ObjectID(value));
                }
            }
            return list;
        }
        return input;
    }
    /**
     * Converts the specified input value to an ObjectID when possible.
     * @param value Input value.
     * @param schema Real column schema.
     * @returns Returns the original value or the converted value.
     */
    static castValue(value, schema) {
        if (schema.formats.includes(Mapping.Types.Format.ID) && (typeof value === 'string' || typeof value === 'number')) {
            if (BSON.ObjectID.isValid(value)) {
                return new BSON.ObjectID(value);
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
            const schema = Mapping.Schema.getRealColumn(model, name, Mapping.Types.View.ALL);
            const column = schema.alias || schema.name;
            const operation = filter[name];
            switch (operation.operator) {
                case Mapping.Statements.Operator.REGEX:
                    entity[column] = { $regex: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.LESS:
                    entity[column] = { $lt: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.LESS_OR_EQUAL:
                    entity[column] = { $lte: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.EQUAL:
                    entity[column] = { $eq: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.NOT_EQUAL:
                    entity[column] = { $neq: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.GREATER_OR_EQUAL:
                    entity[column] = { $gte: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.GREATER:
                    entity[column] = { $gt: Filters_1.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.BETWEEN:
                    entity[column] = { $gte: Filters_1.castValue(operation.value[0], schema), $lte: Filters_1.castValue(operation.value[1], schema) };
                    break;
                case Mapping.Statements.Operator.CONTAIN:
                    entity[column] = { $in: Filters_1.castArray(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.NOT_CONTAIN:
                    entity[column] = { $nin: Filters_1.castArray(operation.value, schema) };
                    break;
            }
        }
        return entity;
    }
};
__decorate([
    Class.Private()
], Filters, "castArray", null);
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
