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
     * Gets a new real level entity based on the specified level information.
     * @param column Level column schema.
     * @param levels Level list.
     * @returns Returns the generated level entity.
     */
    static getRealLevel(column, levels) {
        const current = levels[levels.length - 1];
        return {
            name: current ? `${current.name}.${column.name}` : column.name,
            multiple: column.formats.includes(Mapping.Types.Format.ARRAY),
            column: column,
            previous: current
        };
    }
    /**
     * Gets a new virtual level entity based on the specified level information.
     * @param column Level column schema.
     * @param levels Level list.
     * @returns Returns the level entity.
     */
    static getVirtualLevel(column, levels) {
        const current = levels[levels.length - 1];
        return {
            name: current ? `${current.name}.${column.local}` : column.local,
            virtual: current ? `${current.name}.${column.name}` : column.name,
            multiple: column.multiple,
            column: column,
            previous: current
        };
    }
    /**
     * Gets a new row group based on the specified model type and view modes.
     * @param model Model type.
     * @param views Views modes.
     * @param path Path to determine whether this group is a subgroup.
     * @returns Returns the generated row group.
     */
    static getGrouping(model, views, path) {
        const group = {};
        const columns = {
            ...Mapping.Schema.getRealRow(model, ...views),
            ...Mapping.Schema.getVirtualRow(model, ...views)
        };
        for (const name in columns) {
            const schema = columns[name];
            const column = schema.alias || schema.name;
            group[column] = path ? `$${path}.${column}` : { $first: `$${column}` };
        }
        return group;
    }
    /**
     * Gets a new compound Id based on the specified id and the list of levels.
     * @param id Main id field.
     * @param levels List of levels.
     * @returns Returns the composed id object.
     */
    static getComposedId(id, ...levels) {
        const compound = {
            _id: `${id}`
        };
        for (const level of levels) {
            compound[level.column.name] = `$_${level.column.name}Index`;
        }
        return compound;
    }
    /**
     * Decompose all groups in the specified list of levels to the given pipeline.
     * @param pipeline Current pipeline.
     * @param levels List of levels.
     * @returns Returns the list of decomposed levels.
     */
    static decomposeAll(pipeline, levels) {
        let multiples = [];
        for (const level of levels) {
            if (level.multiple) {
                const unwind = {
                    path: `\$${level.name}`,
                    includeArrayIndex: `_${level.column.name}Index`,
                    preserveNullAndEmptyArrays: true
                };
                pipeline.push({ $unwind: unwind });
                multiples.push(level);
            }
        }
        return multiples;
    }
    /**
     * Compose a subgroup to the given pipeline.
     * @param pipeline Current pipeline.
     * @param group Parent group.
     * @param views Current view modes.
     * @param level Current level.
     * @param last Last level.
     */
    static composeSubgroup(pipeline, group, views, level, last) {
        const name = level.previous ? `_${level.column.name}` : level.column.name;
        const internal = this.getGrouping(level.column.model, views, level.name);
        internal[last.column.name] = `$_${last.column.name}`;
        if (last.column.type === 'joint') {
            internal[last.column.local] = `$_${last.column.local}`;
        }
        group[name] = { $push: internal };
        pipeline.push({ $group: group });
        if (!level.multiple) {
            pipeline.push({ $unwind: { path: `$${name}` } });
        }
    }
    /**
     * Compose a group into the pipeline.
     * @param pipeline Current pipeline.
     * @param group Current group.
     * @param level Current level.
     */
    static composeGroup(pipeline, group, level) {
        const name = level.previous ? `_${level.column.name}` : level.column.name;
        if (level.column.type === 'joint') {
            const local = level.previous ? `_${level.column.local}` : level.column.local;
            if (level.multiple) {
                group[name] = { $push: `$${level.virtual}` };
                group[local] = { $push: `$${level.name}` };
            }
            else {
                group[name] = { $first: `$${level.virtual}` };
                group[local] = { $first: `$${level.name}` };
            }
        }
        else if (level.multiple) {
            group[name] = { $push: `$${level.name}` };
        }
        else {
            group[name] = { $first: `$${level.name}` };
        }
        pipeline.push({ $group: group });
    }
    /**
     * Compose all decomposed levels to the given pipeline.
     * @param pipeline Current pipeline.
     * @param fields List of fields.
     * @param views View modes.
     * @param level First decomposed level.
     * @param multiples List of decomposed levels.
     */
    static composeAll(pipeline, fields, views, level, multiples) {
        let multiple = multiples.pop();
        let currentId = '$_id';
        let last;
        do {
            const group = { ...fields };
            if (level.previous) {
                group['_realId'] = { $first: currentId };
            }
            if (multiple === level) {
                multiple = multiples.pop();
            }
            if (multiple) {
                group['_id'] = this.getComposedId(currentId, ...multiples, multiple);
                currentId = '$_realId';
            }
            else {
                group['_id'] = currentId;
            }
            if (last) {
                this.composeSubgroup(pipeline, group, views, level, last);
            }
            else {
                this.composeGroup(pipeline, group, level);
            }
            last = level;
            level = level.previous;
        } while (level);
    }
    /**
     * Resolve any foreign relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param base Base model type.
     * @param model Current model type.
     * @param views View mode.
     * @param levels List of current levels.
     */
    static resolveForeignRelation(pipeline, project, base, model, views, levels) {
        const joint = Mapping.Schema.getJointRow(model, ...views);
        const fields = this.getGrouping(base, views);
        for (const name in joint) {
            const schema = joint[name];
            const level = this.getVirtualLevel(schema, levels);
            levels.push(level);
            const multiples = this.decomposeAll(pipeline, levels);
            const internal = [
                {
                    $match: { $expr: { $eq: [`$${schema.foreign}`, `$$id`] } }
                }
            ];
            this.applyRelations(internal, schema.model, views);
            pipeline.push({
                $lookup: {
                    from: Mapping.Schema.getStorage(schema.model),
                    let: { id: `$${level.name}` },
                    pipeline: internal,
                    as: level.virtual
                }
            }, {
                $unwind: {
                    path: `\$${level.virtual}`,
                    preserveNullAndEmptyArrays: true
                }
            });
            if (multiples.length > 0) {
                const current = multiples.pop();
                const newer = { ...fields };
                for (const level of multiples) {
                    const column = `_${level.column.name}Index`;
                    newer[column] = { $first: `$${column}` };
                }
                this.composeAll(pipeline, newer, views, current, multiples);
            }
            levels.pop();
            project[schema.name] = true;
        }
    }
    /**
     * Resolve any nested relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param base Base model type.
     * @param model Current model type.
     * @param views View modes.
     * @param levels List of current levels.
     */
    static resolveNestedRelations(pipeline, project, base, model, views, levels) {
        const real = Mapping.Schema.getRealRow(model, ...views);
        for (const name in real) {
            const schema = real[name];
            const column = schema.alias || schema.name;
            if (schema.model && Mapping.Schema.isEntity(schema.model)) {
                levels.push(this.getRealLevel(schema, levels));
                project[column] = this.resolveRelations(pipeline, base, schema.model, views, levels);
                levels.pop();
            }
            else {
                project[column] = true;
            }
        }
    }
    /**
     * Resolve any relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param base Base model type.
     * @param model Current model type.
     * @param views View modes.
     * @param levels List of current levels.
     */
    static resolveRelations(pipeline, base, model, views, levels) {
        const project = {};
        this.resolveForeignRelation(pipeline, project, base, model, views, levels);
        this.resolveNestedRelations(pipeline, project, base, model, views, levels);
        return project;
    }
    /**
     * Apply any relationship in the specified pipeline according to the model type and view mode.
     * @param pipeline Target pipeline.
     * @param model Model type.
     * @param views View modes.
     */
    static applyRelations(pipeline, model, views) {
        const project = this.resolveRelations(pipeline, model, model, views, []);
        pipeline.push({ $project: project });
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
};
__decorate([
    Class.Private()
], Fields, "getRealLevel", null);
__decorate([
    Class.Private()
], Fields, "getVirtualLevel", null);
__decorate([
    Class.Private()
], Fields, "getGrouping", null);
__decorate([
    Class.Private()
], Fields, "getComposedId", null);
__decorate([
    Class.Private()
], Fields, "decomposeAll", null);
__decorate([
    Class.Private()
], Fields, "composeSubgroup", null);
__decorate([
    Class.Private()
], Fields, "composeGroup", null);
__decorate([
    Class.Private()
], Fields, "composeAll", null);
__decorate([
    Class.Private()
], Fields, "resolveForeignRelation", null);
__decorate([
    Class.Private()
], Fields, "resolveNestedRelations", null);
__decorate([
    Class.Private()
], Fields, "resolveRelations", null);
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
Fields = __decorate([
    Class.Describe()
], Fields);
exports.Fields = Fields;
