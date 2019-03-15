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
     * Build and get the grouping of fields based on the specified real and virtual column schemas.
     * @param real Real columns schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    static getGrouping(real, virtual) {
        const source = { ...real, ...virtual };
        const grouping = {};
        for (const id in source) {
            const schema = source[id];
            const name = schema.alias || schema.name;
            grouping[name] = { $first: `$${name}` };
        }
        grouping._id = '$_id';
        return grouping;
    }
    /**
     * Apply any relationship in the specified pipeline according to the model type and view mode.
     * @param pipeline Target pipeline.
     * @param model Model type.
     * @param view View mode.
     */
    static applyRelations(pipeline, model, view) {
        const real = Mapping.Schema.getRealRow(model, view);
        const joint = Mapping.Schema.getJointRow(model, view);
        const virtual = Mapping.Schema.getVirtualRow(model, view);
        const grouping = this.getGrouping(real, virtual);
        for (const column in joint) {
            const schema = joint[column];
            if (schema.multiple) {
                pipeline.push({ $unwind: { path: `\$${schema.local}`, preserveNullAndEmptyArrays: true } });
            }
            pipeline.push({
                $lookup: {
                    from: Mapping.Schema.getStorage(schema.model),
                    let: { id: `$${schema.local}` },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: [`$${schema.foreign}`, `$$id`]
                                }
                            }
                        },
                        {
                            $group: this.getGrouping(Mapping.Schema.getRealRow(schema.model, view), Mapping.Schema.getVirtualRow(schema.model, view))
                        }
                    ],
                    as: schema.virtual
                }
            });
            const group = { ...grouping };
            if (schema.multiple) {
                pipeline.push({ $unwind: { path: `\$${schema.virtual}`, preserveNullAndEmptyArrays: true } });
                group[schema.local] = { $push: `$${schema.local}` };
                group[schema.virtual] = { $push: `$${schema.virtual}` };
            }
            pipeline.push({ $group: group });
        }
    }
    /**
     * Build and get the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     * @throws Throws an error when there is no primary column defined.
     */
    static getPrimaryFilter(model, value) {
        const primary = Mapping.Schema.getPrimaryColumn(model);
        const filters = {};
        filters[primary.name] = {
            operator: Mapping.Statements.Operator.EQUAL,
            value: value
        };
        return filters;
    }
    /**
     * Apply the specified filters into the target pipeline.
     * @param pipeline Target pipeline.
     * @param model Model type.
     * @param filters Filters to be applied.
     */
    static applyFilters(pipeline, model, ...filters) {
        for (const filter of filters) {
            pipeline.push({ $match: filters_1.Filters.build(model, filter) });
        }
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
     * Purge all null fields from the specified entity list.
     * @param model Entity model.
     * @param view View mode.
     * @param entities List of entities to be cleaned.
     * @returns Returns the cleaned entity list.
     */
    static purgeNull(model, view, entities) {
        const real = Mapping.Schema.getRealRow(model, view);
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
    Class.Private()
], Fields, "getGrouping", null);
__decorate([
    Class.Public()
], Fields, "applyRelations", null);
__decorate([
    Class.Public()
], Fields, "getPrimaryFilter", null);
__decorate([
    Class.Public()
], Fields, "applyFilters", null);
__decorate([
    Class.Public()
], Fields, "getSorting", null);
__decorate([
    Class.Public()
], Fields, "purgeNull", null);
Fields = __decorate([
    Class.Describe()
], Fields);
exports.Fields = Fields;
