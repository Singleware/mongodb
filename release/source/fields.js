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
const filters_1 = require("./filters");
/**
 * Field helper class.
 */
let Fields = class Fields extends Class.Null {
    /**
     * Build and get the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     * @throws Throws an error when there is no primary column defined.
     */
    static getPrimaryFilter(model, value) {
        const primary = Mapping.Schema.getRealPrimaryColumn(model);
        if (!primary) {
            throw new Error(`There is no primary column to be used.`);
        }
        const filters = {};
        filters[primary.name] = {
            operator: Mapping.Statements.Operator.EQUAL,
            value: value
        };
        return filters;
    }
    /**
     * Build and get the field grouping based on the specified real and virtual column schemas.
     * @param real Real columns schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    static getGrouping(real, virtual) {
        const source = { ...real, ...virtual };
        const grouping = {};
        for (const id in source) {
            const column = source[id];
            const name = column.alias || column.name;
            grouping[name] = { $first: `$${name}` };
        }
        grouping._id = '$_id';
        return grouping;
    }
    /**
     * Build and get the sorting entity based on the specified sort object.
     * @param sort Columns to sort.
     * @returns Returns the sorting entity.
     */
    static getSorting(sort) {
        const sorting = {};
        for (const column in sort) {
            switch (sort[column]) {
                case Mapping.Statements.Order.ASCENDING:
                    sorting[column] = 1;
                    break;
                case Mapping.Statements.Order.DESCENDING:
                    sorting[column] = -1;
                    break;
            }
        }
        return sorting;
    }
    /**
     * Apply the specified grouping and join list into the target pipeline.
     * @param pipeline Target pipeline.
     * @param grouping Default grouping.
     * @param joins List of joins.
     */
    static applyRelations(pipeline, grouping, joins) {
        for (const column of joins) {
            const group = { ...grouping };
            if (column.multiple) {
                pipeline.push({
                    $unwind: {
                        path: `\$${column.local}`,
                        preserveNullAndEmptyArrays: true
                    }
                });
            }
            pipeline.push({
                $lookup: {
                    from: column.storage,
                    localField: column.local,
                    foreignField: column.foreign,
                    as: column.virtual
                }
            });
            if (column.multiple) {
                pipeline.push({
                    $unwind: {
                        path: `\$${column.virtual}`,
                        preserveNullAndEmptyArrays: true
                    }
                });
                group[column.local] = { $push: `$${column.local}` };
                group[column.virtual] = { $push: `$${column.virtual}` };
            }
            pipeline.push({
                $group: group
            });
        }
    }
    /**
     * Apply the specified filters into the target pipeline.
     * @param model Model type.
     * @param pipeline Target pipeline.
     * @param filters Filters to be applied.
     */
    static applyFilters(model, pipeline, ...filters) {
        for (const filter of filters) {
            pipeline.push({
                $match: filters_1.Filters.build(model, filter)
            });
        }
    }
    /**
     * Purge all null fields from the specified entity list.
     * @param real Real column schema.
     * @param entities Entity list to be purged.
     * @returns Returns the purged entity list.
     */
    static purgeNull(real, entities) {
        let schema;
        for (let i = 0; i < entities.length; ++i) {
            for (const column in entities[i]) {
                if (entities[i][column] === null && (schema = real[column]) && !schema.formats.includes(Mapping.Types.Format.NULL)) {
                    delete entities[i][column];
                }
            }
        }
        return entities;
    }
};
__decorate([
    Class.Public()
], Fields, "getPrimaryFilter", null);
__decorate([
    Class.Public()
], Fields, "getGrouping", null);
__decorate([
    Class.Public()
], Fields, "getSorting", null);
__decorate([
    Class.Public()
], Fields, "applyRelations", null);
__decorate([
    Class.Public()
], Fields, "applyFilters", null);
__decorate([
    Class.Public()
], Fields, "purgeNull", null);
Fields = __decorate([
    Class.Describe()
], Fields);
exports.Fields = Fields;
