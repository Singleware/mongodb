"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Driver_1;
"use strict";
/**
 * Copyright (C) 2018 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Mongodb = require("mongodb");
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const filters_1 = require("./filters");
const schemas_1 = require("./schemas");
/**
 * Mongo DB driver class.
 */
let Driver = Driver_1 = class Driver extends Class.Null {
    /**
     * Gets the collection name from the specified model type.
     * @param model Mode type.
     * @returns Returns the collection name.
     * @throws Throws an error when the model type isn't valid.
     */
    static getCollectionName(model) {
        const name = Mapping.Schema.getStorage(model);
        if (!name) {
            throw new Error(`There is no collection name for the specified model type.`);
        }
        return name;
    }
    /**
     * Build and get the collection validation.
     * @param model Model type.
     * @returns Returns the collection validation object.
     */
    static getCollectionValidation(model) {
        const schema = Mapping.Schema.getRealRow(model);
        if (!schema) {
            throw new TypeError(`The specified entity model is not valid.`);
        }
        return {
            validator: {
                $jsonSchema: schemas_1.Schemas.build(schema)
            },
            validationLevel: 'strict',
            validationAction: 'error'
        };
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
        if (!primary) {
            throw new Error(`There is no primary column to be used.`);
        }
        filters[primary.name] = { operator: Mapping.Statements.Operator.EQUAL, value: value };
        return filters;
    }
    /**
     * Build and get the field grouping based on the specified row schema.
     * @param real Real columns schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    static getFieldGrouping(real, virtual) {
        const source = { ...real, ...virtual };
        const grouping = {};
        for (const id in source) {
            const column = source[id];
            const name = 'alias' in column && column.alias !== void 0 ? column.alias : column.name;
            grouping[name] = { $first: `$${name}` };
        }
        grouping._id = '$_id';
        return grouping;
    }
    /**
     * Apply the specified aggregations into the target pipeline.
     * @param pipeline Target pipeline.
     * @param grouping Default grouping.
     * @param joins List of junctions.
     */
    static applyJoins(pipeline, grouping, joins) {
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
     * @param pipeline Target pipeline.
     * @param filters Filters to be applied.
     */
    static applyFilters(pipeline, filters) {
        while (filters.length) {
            pipeline.push(filters);
        }
    }
    /**
     * Purge all empty fields from the specified entities.
     * @param real Real column schema.
     * @param entities Entities to be purged.
     * @returns Returns the purged entities list.
     */
    static purgeEmptyFields(real, ...entities) {
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
    /**
     * Connect to the MongoDb URI.
     * @param uri Connection URI.
     */
    async connect(uri) {
        await new Promise((resolve, reject) => {
            Mongodb.MongoClient.connect(uri, Driver_1.options, (error, connection) => {
                if (error) {
                    reject(error);
                }
                else {
                    this.connection = connection;
                    this.database = connection.db();
                    resolve();
                }
            });
        });
    }
    /**
     * Disconnect the current active connection.
     */
    async disconnect() {
        return new Promise((resolve, reject) => {
            this.connection.close((error) => {
                if (error) {
                    reject(error);
                }
                else {
                    this.connection = void 0;
                    this.database = void 0;
                    resolve();
                }
            });
        });
    }
    /**
     * Modifies the collection by the specified model type.
     * @param model Model type.
     */
    async modify(model) {
        await this.database.command({
            collMod: Driver_1.getCollectionName(model),
            ...Driver_1.getCollectionValidation(model)
        });
    }
    /**
     * Creates the collection by the specified model type.
     * @param model Model type.
     */
    async create(model) {
        await this.database.command({
            create: Driver_1.getCollectionName(model),
            ...Driver_1.getCollectionValidation(model)
        });
    }
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    async insert(model, entities) {
        const manager = this.database.collection(Driver_1.getCollectionName(model));
        const result = await manager.insertMany(entities);
        return Object.values(result.insertedIds);
    }
    /**
     * Finds the corresponding entity from the database.
     * @param model Model type.
     * @param joins List of junctions.
     * @param filters List of filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns the  promise to get the list of entities found.
     * @returns Returns the list of entities found.
     */
    async find(model, joins, filters, sort, limit) {
        const real = Mapping.Schema.getRealRow(model);
        const virtual = Mapping.Schema.getVirtualRow(model);
        const pipeline = [{ $match: filters_1.Filters.build(model, filters.shift()) }];
        const manager = this.database.collection(Driver_1.getCollectionName(model));
        Driver_1.applyJoins(pipeline, Driver_1.getFieldGrouping(real, virtual), joins);
        Driver_1.applyFilters(pipeline, filters);
        return await Class.perform(this, async () => {
            let records = await manager.aggregate(pipeline);
            if (sort) {
                records = await records.sort(sort);
            }
            if (limit) {
                records = await records.skip(limit.start).limit(limit.count);
            }
            return Driver_1.purgeEmptyFields(real, records);
        });
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param joins List of junctions.
     * @param id Entity id.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(model, joins, id) {
        return (await this.find(model, joins, [Driver_1.getPrimaryFilter(model, id)]))[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param entity Entity data to be updated.
     * @param filter Filter expression.
     * @returns Returns the number of updated entities.
     */
    async update(model, entity, filter) {
        const manager = this.database.collection(Driver_1.getCollectionName(model));
        const result = await manager.updateMany(filters_1.Filters.build(model, filter), { $set: entity });
        return result.modifiedCount;
    }
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param entity Entity data to be updated.
     * @param id Entity id.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, entity, id) {
        return (await this.update(model, entity, Driver_1.getPrimaryFilter(model, id))) === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Filter columns.
     * @return Returns the number of deleted entities.
     */
    async delete(model, filter) {
        const manager = this.database.collection(Driver_1.getCollectionName(model));
        const result = await manager.deleteMany(filters_1.Filters.build(model, filter));
        return result.deletedCount || 0;
    }
    /**
     * Deletes the entity that corresponds to the specified id.
     * @param model Model type.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, id) {
        return (await this.delete(model, Driver_1.getPrimaryFilter(model, id))) === 1;
    }
};
/**
 * Driver connection options.
 */
Driver.options = {
    useNewUrlParser: true,
    ignoreUndefined: true
};
__decorate([
    Class.Private()
], Driver.prototype, "connection", void 0);
__decorate([
    Class.Private()
], Driver.prototype, "database", void 0);
__decorate([
    Class.Public()
], Driver.prototype, "connect", null);
__decorate([
    Class.Public()
], Driver.prototype, "disconnect", null);
__decorate([
    Class.Public()
], Driver.prototype, "modify", null);
__decorate([
    Class.Public()
], Driver.prototype, "create", null);
__decorate([
    Class.Public()
], Driver.prototype, "insert", null);
__decorate([
    Class.Public()
], Driver.prototype, "find", null);
__decorate([
    Class.Public()
], Driver.prototype, "findById", null);
__decorate([
    Class.Public()
], Driver.prototype, "update", null);
__decorate([
    Class.Public()
], Driver.prototype, "updateById", null);
__decorate([
    Class.Public()
], Driver.prototype, "delete", null);
__decorate([
    Class.Public()
], Driver.prototype, "deleteById", null);
__decorate([
    Class.Private()
], Driver, "options", void 0);
__decorate([
    Class.Private()
], Driver, "getCollectionName", null);
__decorate([
    Class.Private()
], Driver, "getCollectionValidation", null);
__decorate([
    Class.Private()
], Driver, "getPrimaryFilter", null);
__decorate([
    Class.Private()
], Driver, "getFieldGrouping", null);
__decorate([
    Class.Private()
], Driver, "applyJoins", null);
__decorate([
    Class.Private()
], Driver, "applyFilters", null);
__decorate([
    Class.Private()
], Driver, "purgeEmptyFields", null);
Driver = Driver_1 = __decorate([
    Class.Describe()
], Driver);
exports.Driver = Driver;
