"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Source = require("mongodb");
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
/**
 * Mongo DB filters class.
 */
let Filters = class Filters {
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
            const schema = Mapping.Schema.getColumn(model, name);
            if (!schema) {
                throw new Error(`Column '${name}' does not exists.`);
            }
            if (schema.types.includes(Mapping.Format.ID) && Source.ObjectId.isValid(operation.value)) {
                operation.value = new Source.ObjectId(operation.value);
            }
            const column = schema.alias || schema.name;
            switch (operation.operator) {
                case Mapping.Operator.LESS:
                    entity[column] = { $lt: operation.value };
                    break;
                case Mapping.Operator.LESS_OR_EQUAL:
                    entity[column] = { $lte: operation.value };
                    break;
                case Mapping.Operator.EQUAL:
                    entity[column] = { $eq: operation.value };
                    break;
                case Mapping.Operator.NOT_EQUAL:
                    entity[column] = { $neq: operation.value };
                    break;
                case Mapping.Operator.GREATER_OR_EQUAL:
                    entity[column] = { $gte: operation.value };
                    break;
                case Mapping.Operator.GREATER:
                    entity[column] = { $gt: operation.value };
                    break;
                case Mapping.Operator.BETWEEN:
                    entity[column] = { $gte: operation.value[0], $lte: operation.value[1] };
                    break;
                case Mapping.Operator.CONTAIN:
                    entity[column] = { $in: [...operation.value] };
                    break;
                case Mapping.Operator.NOT_CONTAIN:
                    entity[column] = { $nin: [...operation.value] };
                    break;
            }
        }
        return entity;
    }
};
__decorate([
    Class.Public()
], Filters, "build", null);
Filters = __decorate([
    Class.Describe()
], Filters);
exports.Filters = Filters;
