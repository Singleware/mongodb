"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Aliases = require("../aliases");
const BSON = require("./bson");
/**
 * Match helper class.
 */
let Match = class Match extends Class.Null {
    /**
     * Try to convert the specified input array to an ObjectID array.
     * @param input Input array.
     * @param schema Column schema.
     * @returns Returns the array containing all converted and not converted values
     * @throws Throws an type error when the specified value isn't an array.
     */
    static castArray(input, schema) {
        if (!(input instanceof Array)) {
            throw new TypeError(`The filter input must be an array.`);
        }
        else if (schema.model === BSON.ObjectId) {
            return input.map(value => (BSON.ObjectId.isValid(value) ? new BSON.ObjectId(value) : value));
        }
        else {
            return input;
        }
    }
    /**
     * Try to convert the specified input value to an ObjectID.
     * @param value Input value.
     * @param schema Column schema.
     * @returns Returns the converted value when the operation was successful, otherwise returns the input value.
     */
    static castValue(value, schema) {
        if (schema.formats.includes(Aliases.Format.Id) && BSON.ObjectId.isValid(value)) {
            return new BSON.ObjectId(value);
        }
        else {
            return value;
        }
    }
    /**
     * Build a new match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns the new match entity.
     */
    static buildMatch(model, match) {
        const entity = {};
        for (const name in match) {
            const schema = Aliases.Schema.getRealColumn(model, name);
            const column = schema.alias || schema.name;
            const operation = match[name];
            switch (operation.operator) {
                case Aliases.Operator.LessThan:
                    entity[column] = { $lt: this.castValue(operation.value, schema) };
                    break;
                case Aliases.Operator.LessThanOrEqual:
                    entity[column] = { $lte: this.castValue(operation.value, schema) };
                    break;
                case Aliases.Operator.Equal:
                    entity[column] = { $eq: this.castValue(operation.value, schema) };
                    break;
                case Aliases.Operator.NotEqual:
                    entity[column] = { $ne: this.castValue(operation.value, schema) };
                    break;
                case Aliases.Operator.GreaterThanOrEqual:
                    entity[column] = { $gte: this.castValue(operation.value, schema) };
                    break;
                case Aliases.Operator.GreaterThan:
                    entity[column] = { $gt: this.castValue(operation.value, schema) };
                    break;
                case Aliases.Operator.Between:
                    entity[column] = { $gte: this.castValue(operation.value[0], schema), $lte: this.castValue(operation.value[1], schema) };
                    break;
                case Aliases.Operator.Contain:
                    entity[column] = { $in: this.castArray(operation.value, schema) };
                    break;
                case Aliases.Operator.NotContain:
                    entity[column] = { $nin: this.castArray(operation.value, schema) };
                    break;
                case Aliases.Operator.RegExp:
                    entity[column] = { $regex: this.castValue(operation.value, schema) };
                    break;
            }
        }
        return entity;
    }
    /**
     * Build a new match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns a new match entity.
     */
    static build(model, match) {
        if (match instanceof Array) {
            return { $or: match.map(match => this.buildMatch(model, match)) };
        }
        else {
            return this.buildMatch(model, match);
        }
    }
};
__decorate([
    Class.Private()
], Match, "castArray", null);
__decorate([
    Class.Private()
], Match, "castValue", null);
__decorate([
    Class.Private()
], Match, "buildMatch", null);
__decorate([
    Class.Public()
], Match, "build", null);
Match = __decorate([
    Class.Describe()
], Match);
exports.Match = Match;
//# sourceMappingURL=match.js.map