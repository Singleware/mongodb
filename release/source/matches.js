"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const BSON = require("./bson");
/**
 * Matches helper class.
 */
let Matches = class Matches extends Class.Null {
    /**
     * Converts the specified input array to an array of ObjectID when possible.
     * @param input Input array.
     * @param schema Column schema.
     * @returns Returns the original value or the converted array.
     * @throws Throws an type error when the specified value isn't an array.
     */
    static castArray(input, schema) {
        if (!(input instanceof Array)) {
            throw new TypeError(`The filter input must be an array.`);
        }
        else if (schema.model !== BSON.ObjectID) {
            return input;
        }
        else {
            const list = [];
            for (const value of input) {
                if (BSON.ObjectID.isValid(value)) {
                    list.push(new BSON.ObjectID(value));
                }
            }
            return list;
        }
    }
    /**
     * Converts the specified input value to an ObjectID when possible.
     * @param value Input value.
     * @param schema Real column schema.
     * @returns Returns the original value or the converted value.
     */
    static castValue(value, schema) {
        if (schema.formats.includes(Mapping.Types.Format.ID) && (typeof value === 'string' || typeof value === 'number') && BSON.ObjectID.isValid(value)) {
            return new BSON.ObjectID(value);
        }
        else {
            return value;
        }
    }
    /**
     * Build a match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression.
     * @returns Returns the generated match entity.
     */
    static buildMatch(model, match) {
        const entity = {};
        for (const name in match) {
            const schema = Mapping.Schema.getRealColumn(model, name);
            const column = schema.alias || schema.name;
            const operation = match[name];
            switch (operation.operator) {
                case Mapping.Statements.Operator.REGEX:
                    entity[column] = { $regex: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.LESS:
                    entity[column] = { $lt: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.LESS_OR_EQUAL:
                    entity[column] = { $lte: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.EQUAL:
                    entity[column] = { $eq: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.NOT_EQUAL:
                    entity[column] = { $ne: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.GREATER_OR_EQUAL:
                    entity[column] = { $gte: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.GREATER:
                    entity[column] = { $gt: this.castValue(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.BETWEEN:
                    entity[column] = { $gte: this.castValue(operation.value[0], schema), $lte: this.castValue(operation.value[1], schema) };
                    break;
                case Mapping.Statements.Operator.CONTAIN:
                    entity[column] = { $in: this.castArray(operation.value, schema) };
                    break;
                case Mapping.Statements.Operator.NOT_CONTAIN:
                    entity[column] = { $nin: this.castArray(operation.value, schema) };
                    break;
            }
        }
        return entity;
    }
    /**
     * Build a match entity from the specified match expression.
     * @param model Model type.
     * @param match Match expression or list of match expressions.
     * @returns Returns a single generated match entity or the generated match entity list.
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
], Matches, "castArray", null);
__decorate([
    Class.Private()
], Matches, "castValue", null);
__decorate([
    Class.Public()
], Matches, "buildMatch", null);
__decorate([
    Class.Public()
], Matches, "build", null);
Matches = __decorate([
    Class.Describe()
], Matches);
exports.Matches = Matches;
