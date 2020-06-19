"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match = void 0;
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const Types = require("../types");
const BSON = require("./bson");
/**
 * Match helper class.
 */
let Match = class Match extends Class.Null {
    /**
     * Try to convert the specified input value to a filterable.
     * @param value Input value.
     * @param schema Column schema.
     * @returns Returns the converted value or the specified input value.
     */
    static castValue(value, schema) {
        if (schema.model === BSON.ObjectId || schema.formats.includes(0 /* Id */)) {
            return BSON.ObjectId.isValid(value) ? new BSON.ObjectId(value) : value;
        }
        else if (schema.model === Date || schema.formats.includes(11 /* Date */)) {
            return !isNaN(Date.parse(value)) ? new Date(Date.parse(value)) : value;
        }
        return value;
    }
    /**
     * Try to convert the specified input array to a filterable array.
     * @param input Input array.
     * @param schema Column schema.
     * @returns Returns the array containing all converted and not converted values.
     * @throws Throws an type error when the specified value isn't an array.
     */
    static castArray(input, schema) {
        if (!(input instanceof Array)) {
            throw new TypeError(`The filter input must be an array.`);
        }
        else {
            return input.map(value => this.castValue(value, schema));
        }
    }
    /**
     * Attach a new operation in the given operations map.
     * @param schemas Column schemas.
     * @param operations Operations map.
     * @param operator Operator type.
     * @param value Operation value.
     */
    static attachOperation(schemas, operations, operator, value) {
        const path = Types.Columns.Helper.getPath(schemas);
        const schema = schemas[schemas.length - 1];
        switch (operator) {
            case "lt" /* LessThan */:
                operations[path] = { $lt: this.castValue(value, schema) };
                break;
            case "lte" /* LessThanOrEqual */:
                operations[path] = { $lte: this.castValue(value, schema) };
                break;
            case "eq" /* Equal */:
                operations[path] = { $eq: this.castValue(value, schema) };
                break;
            case "ne" /* NotEqual */:
                operations[path] = { $ne: this.castValue(value, schema) };
                break;
            case "gte" /* GreaterThanOrEqual */:
                operations[path] = { $gte: this.castValue(value, schema) };
                break;
            case "gt" /* GreaterThan */:
                operations[path] = { $gt: this.castValue(value, schema) };
                break;
            case "in" /* Contain */:
                operations[path] = { $in: this.castArray(value, schema) };
                break;
            case "nin" /* NotContain */:
                operations[path] = { $nin: this.castArray(value, schema) };
                break;
            case "re" /* RegExp */:
                operations[path] = { $regex: this.castValue(value, schema) };
                break;
            case "bt" /* Between */:
                operations[path] = {
                    $gte: this.castValue(value[0], schema),
                    $lte: this.castValue(value[1], schema)
                };
                break;
            default:
                throw new Error(`Invalid operator '${operator}' for the given path '${path}'.`);
        }
    }
    /**
     * Build a new matching operation based the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns the new matching operation.
     */
    static buildExpression(model, match) {
        const entity = {};
        for (const column in match) {
            const schemas = Mapping.Helper.getPathColumns(model, column);
            const operation = match[column];
            if (Mapping.Filters.Helper.isOperation(operation)) {
                this.attachOperation(schemas, entity, operation.operator, operation.value);
            }
            else {
                const entry = Object.entries(operation)[0];
                this.attachOperation(schemas, entity, entry[0], entry[1]);
            }
        }
        return entity;
    }
    /**
     * Build a new matching entity based on the specified matching expressions.
     * @param model Model type.
     * @param match Matching expressions.
     * @returns Returns the new matching entity.
     */
    static build(model, match) {
        if (match instanceof Array) {
            return { $or: match.map(match => this.buildExpression(model, match)) };
        }
        return this.buildExpression(model, match);
    }
};
__decorate([
    Class.Private()
], Match, "castValue", null);
__decorate([
    Class.Private()
], Match, "castArray", null);
__decorate([
    Class.Private()
], Match, "attachOperation", null);
__decorate([
    Class.Private()
], Match, "buildExpression", null);
__decorate([
    Class.Public()
], Match, "build", null);
Match = __decorate([
    Class.Describe()
], Match);
exports.Match = Match;
//# sourceMappingURL=match.js.map