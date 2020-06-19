"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pipeline = void 0;
/*!
 * Copyright (C) 2018-2020 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const Types = require("../types");
const match_1 = require("./match");
const sort_1 = require("./sort");
/**
 * Pipeline helper class.
 */
let Pipeline = class Pipeline extends Class.Null {
    /**
     * Get all viewed fields based on the specified model type and the given fields to select.
     * @param model Model type.
     * @param fields Fields to select.
     * @returns Returns the view list.
     */
    static getView(model, fields) {
        const column = Types.Schema.tryPrimaryColumn(model);
        const fieldset = new Set(column !== void 0 ? [Mapping.Columns.Helper.getName(column)] : void 0);
        const schemas = {
            ...Types.Schema.getRealRow(model, ...fields),
            ...Types.Schema.getVirtualRow(model, ...fields)
        };
        for (const name in schemas) {
            const schema = schemas[name];
            if (schema.type === "virtual" /* Virtual */) {
                fieldset.add(schema.local);
            }
            fieldset.add(Mapping.Columns.Helper.getName(schemas[name]));
        }
        return [...fieldset.values()];
    }
    /**
     * Gets a new real level based on the specified column schema and the given fields to select.
     * @param schema Level column schema.
     * @param levels Level list.
     * @param fields Fields to select.
     * @returns Returns the generated level entity.
     */
    static getRealLevel(schema, levels, fields) {
        const current = levels[levels.length - 1];
        return {
            name: current ? `${current.name}.${schema.name}` : schema.name,
            fields: Mapping.Columns.Helper.getNestedFields(schema, fields),
            multiple: schema.formats.includes(12 /* Array */),
            column: schema,
            previous: current
        };
    }
    /**
     * Gets a new virtual level based on the specified column schema and the given fields to select.
     * @param schema Level column schema.
     * @param levels Level list.
     * @param fields Fields to select.
     * @returns Returns the generated level entity.
     */
    static getVirtualLevel(schema, levels, fields) {
        const current = levels[levels.length - 1];
        return {
            name: current ? `${current.name}.${schema.local}` : schema.local,
            virtual: current ? `${current.name}.${schema.name}` : schema.name,
            fields: fields.length > 0 ? Mapping.Columns.Helper.getNestedFields(schema, fields) : schema.fields || [],
            multiple: schema.multiple,
            column: schema,
            previous: current
        };
    }
    /**
     * Get a new group rule based on the specified model type and viewed fields.
     * @param view Viewed fields.
     * @param path Path to determine whether it's a subgroup.
     * @returns Returns the generated group rule entity.
     */
    static getGroupRule(view, path) {
        const rule = {};
        for (const field of view) {
            rule[field] = path ? `$${path}.${field}` : { $first: `$${field}` };
        }
        return rule;
    }
    /**
     * Get a new project rule based on the specified model type and viewed fields.
     * @param view Viewed fields.
     * @returns Returns the generated project rule entity.
     */
    static getProjectRule(view) {
        const rule = {};
        for (const field of view) {
            rule[field] = { $ifNull: [`$${field}`, '$$REMOVE'] };
        }
        return rule;
    }
    /**
     * Gets a new compound Id based on the specified main field Id and the list of levels.
     * @param id Main field Id.
     * @param levels List of levels.
     * @returns Returns the composed Id entity.
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
                pipeline.push({
                    $unwind: {
                        path: `\$${level.name}`,
                        includeArrayIndex: `_${level.column.name}Index`,
                        preserveNullAndEmptyArrays: true
                    }
                });
                multiples.push(level);
            }
        }
        return multiples;
    }
    /**
     * Compose a subgroup into the given pipeline.
     * @param pipeline Current pipeline.
     * @param group Parent group.
     * @param fields Fields to select.
     * @param level Current level.
     * @param last Last level.
     */
    static composeSubgroup(pipeline, group, level, last) {
        const name = level.previous ? `_${level.column.name}` : level.column.name;
        const model = Mapping.Helper.getEntityModel(level.column.model);
        const internal = this.getGroupRule(this.getView(model, level.fields), level.name);
        internal[last.column.name] = `$_${last.column.name}`;
        if (last.column.type === 'virtual') {
            internal[last.column.local] = `$_${last.column.local}`;
        }
        group[name] = { $push: internal };
        pipeline.push({ $group: group });
        pipeline.push({ $project: this.getProjectRule(Object.keys(group)) });
        if (!level.multiple && !level.all) {
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
        if (level.column.type === 'virtual') {
            const local = level.previous
                ? `_${level.column.local}`
                : level.column.local;
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
        pipeline.push({ $project: this.getProjectRule(Object.keys(group)) });
    }
    /**
     * Compose all decomposed levels to the given pipeline.
     * @param pipeline Current pipeline.
     * @param properties List of fields.
     * @param fields Fields to select.
     * @param level First decomposed level.
     * @param multiples List of decomposed levels.
     */
    static composeAll(pipeline, properties, level, multiples) {
        let multiple = multiples.pop();
        let currentId = '$_id';
        let last;
        do {
            const group = { ...properties };
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
                this.composeSubgroup(pipeline, group, level, last);
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
     * @param model Model type.
     * @param view Viewed fields.
     * @param fields Fields to select.
     * @param levels List of current levels.
     */
    static resolveForeignRelation(pipeline, project, model, view, fields, levels) {
        const row = Types.Schema.getVirtualRow(model, ...fields);
        const group = this.getGroupRule(view);
        for (const name in row) {
            const schema = row[name];
            const resolved = Mapping.Helper.getEntityModel(schema.model);
            const foreign = Types.Schema.getRealColumn(resolved, schema.foreign);
            const level = this.getVirtualLevel(schema, levels, fields);
            levels.push(level);
            const multiples = this.decomposeAll(pipeline, levels);
            pipeline.push({
                $lookup: {
                    from: Types.Schema.getStorageName(resolved),
                    let: { id: `$${level.name}` },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: [`$${Mapping.Columns.Helper.getName(foreign)}`, `$$id`] }
                            }
                        },
                        ...this.build(resolved, schema.query || {}, level.fields)
                    ],
                    as: level.virtual
                }
            });
            if (!schema.all) {
                pipeline.push({
                    $unwind: {
                        path: `\$${level.virtual}`,
                        preserveNullAndEmptyArrays: true
                    }
                });
            }
            if (multiples.length > 0) {
                const current = multiples.pop();
                const newer = { ...group };
                for (const level of multiples) {
                    const column = `_${level.column.name}Index`;
                    newer[column] = { $first: `$${column}` };
                }
                this.composeAll(pipeline, newer, current, multiples);
            }
            levels.pop();
            project[schema.name] = true;
        }
    }
    /**
     * Resolve any nested relationship in the given model type to the specified pipeline.
     * @param pipeline Current pipeline.
     * @param project Current projection.
     * @param model Model type.
     * @param view Viewed fields.
     * @param fields Fields to selected.
     * @param levels List of current levels.
     */
    static resolveNestedRelations(pipeline, project, model, view, fields, levels) {
        const real = Types.Schema.getRealRow(model, ...fields);
        for (const name in real) {
            const schema = real[name];
            const column = Mapping.Columns.Helper.getName(schema);
            if (schema.model && Types.Schema.isEntity(schema.model)) {
                const resolved = Mapping.Helper.getEntityModel(schema.model);
                const level = this.getRealLevel(schema, levels, fields);
                levels.push(level);
                const nested = this.applyRelationship(pipeline, resolved, view, level.fields, levels);
                if (schema.formats.includes(13 /* Map */)) {
                    project[column] = true;
                }
                else {
                    project[column] = nested;
                }
                levels.pop();
            }
            else {
                project[column] = true;
            }
        }
    }
    /**
     * Applies any relationship in the given model type into the specified pipeline.
     * @param pipeline Current pipeline.
     * @param base Base model type.
     * @param model Current model type.
     * @param fields Fields to select.
     * @param levels List of current levels.
     * @returns Returns the pipeline projection.
     */
    static applyRelationship(pipeline, model, view, fields, levels) {
        const project = {};
        this.resolveForeignRelation(pipeline, project, model, view, fields, levels);
        this.resolveNestedRelations(pipeline, project, model, view, fields, levels);
        return project;
    }
    /**
     * Build a new pipeline entity based on the specified model type, fields and query filter.
     * @param model Model type.
     * @param fields Fields to select.
     * @param query Query filter.
     * @returns Returns the new pipeline entity.
     */
    static build(model, query, fields) {
        const pipeline = [];
        if (query.pre) {
            pipeline.push({ $match: match_1.Match.build(model, query.pre) });
        }
        const view = this.getView(model, fields);
        const project = this.applyRelationship(pipeline, model, view, fields, []);
        if (query.post) {
            pipeline.push({ $match: match_1.Match.build(model, query.post) });
        }
        if (query.sort) {
            pipeline.push({ $sort: sort_1.Sort.build(model, query.sort) });
        }
        if (query.limit) {
            if (query.limit.start > 0) {
                pipeline.push({ $skip: query.limit.start });
            }
            pipeline.push({ $limit: query.limit.count });
        }
        if (view.length > 0) {
            pipeline.push({ $project: project });
        }
        return pipeline;
    }
};
__decorate([
    Class.Private()
], Pipeline, "getView", null);
__decorate([
    Class.Private()
], Pipeline, "getRealLevel", null);
__decorate([
    Class.Private()
], Pipeline, "getVirtualLevel", null);
__decorate([
    Class.Private()
], Pipeline, "getGroupRule", null);
__decorate([
    Class.Private()
], Pipeline, "getProjectRule", null);
__decorate([
    Class.Private()
], Pipeline, "getComposedId", null);
__decorate([
    Class.Private()
], Pipeline, "decomposeAll", null);
__decorate([
    Class.Private()
], Pipeline, "composeSubgroup", null);
__decorate([
    Class.Private()
], Pipeline, "composeGroup", null);
__decorate([
    Class.Private()
], Pipeline, "composeAll", null);
__decorate([
    Class.Private()
], Pipeline, "resolveForeignRelation", null);
__decorate([
    Class.Private()
], Pipeline, "resolveNestedRelations", null);
__decorate([
    Class.Private()
], Pipeline, "applyRelationship", null);
__decorate([
    Class.Public()
], Pipeline, "build", null);
Pipeline = __decorate([
    Class.Describe()
], Pipeline);
exports.Pipeline = Pipeline;
//# sourceMappingURL=pipeline.js.map