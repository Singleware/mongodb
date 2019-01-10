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
const Mongodb = require("mongodb");
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const filters_1 = require("./filters");
const schemas_1 = require("./schemas");
/**
 * Mongo DB driver class.
 */
let Driver = class Driver extends Class.Null {
    /**
     * Mongo DB driver class.
     */
    constructor() {
        super(...arguments);
        /**
         * Driver connection options.
         */
        this.options = {
            useNewUrlParser: true,
            ignoreUndefined: true
        };
    }
    /**
     * Gets the collection name from the specified model type.
     * @param model Mode type.
     * @returns Returns the collection name.
     * @throws Throws an error when the model type is not valid.
     */
    getCollectionName(model) {
        const name = Mapping.Schema.getStorage(model);
        if (!name) {
            throw new Error(`There is no collection name for the specified model type.`);
        }
        return name;
    }
    /**
     * Gets the collection options.
     * @param model Model type.
     * @returns Returns the collection command object.
     */
    getCollectionOptions(model) {
        return {
            validator: {
                $jsonSchema: schemas_1.Schemas.build(Mapping.Schema.getRow(model))
            },
            validationLevel: 'strict',
            validationAction: 'error'
        };
    }
    /**
     * Gets the primary property from the specified model type.
     * @param model Mode type.
     * @returns Returns the primary column name.
     * @throws Throws an error when there is no primary column defined.
     */
    getPrimaryProperty(model) {
        const column = Mapping.Schema.getPrimary(model);
        if (!column) {
            throw new Error(`There is no primary column to be used.`);
        }
        return column;
    }
    /**
     * Gets the primary filter based in the specified model type.
     * @param model Model type.
     * @param value Primary id value.
     * @returns Returns the primary filter.
     */
    getPrimaryFilter(model, value) {
        const filters = {};
        const primary = this.getPrimaryProperty(model);
        filters[primary.name] = { operator: Mapping.Operator.EQUAL, value: value };
        return filters;
    }
    /**
     * Gets the fields grouping based on the specified row schema.
     * @param row Row schema.
     * @param virtual Virtual schema.
     * @returns Returns the grouping entity.
     */
    getFieldsGrouping(row, virtual) {
        const group = {};
        for (const column in row) {
            const name = row[column].alias || row[column].name;
            group[name] = { $first: `$${name}` };
        }
        for (const column in virtual) {
            const name = virtual[column].name;
            group[name] = { $first: `$${name}` };
        }
        group._id = '$_id';
        return group;
    }
    /**
     * Purge all null fields returned by default in a performed query.
     * @param row Row schema.
     * @param entities Entities to be purged.
     * @returns Returns the purged entities list.
     */
    purgeNullFields(row, ...entities) {
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
            for (const column in entity) {
                let schema;
                if (entity[column] === null && (schema = row[column]) && !schema.types.includes(Mapping.Format.NULL)) {
                    delete entity[column];
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
            Mongodb.MongoClient.connect(uri, this.options, (error, connection) => {
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
            collMod: this.getCollectionName(model),
            ...this.getCollectionOptions(model)
        });
    }
    /**
     * Creates the collection by the specified model type.
     * @param model Model type.
     */
    async create(model) {
        await this.database.command({
            create: this.getCollectionName(model),
            ...this.getCollectionOptions(model)
        });
    }
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    async insert(model, ...entities) {
        const manager = this.database.collection(this.getCollectionName(model));
        const result = await manager.insertMany(entities);
        return Object.values(result.insertedIds);
    }
    /**
     * Finds the corresponding entity from the database.
     * @param model Model type.
     * @param filter Filter expression.
     * @param aggregate Aggregated entries.
     * @returns Returns the list of entities found.
     */
    async find(model, filter, aggregate) {
        const row = Mapping.Schema.getRow(model);
        const virtual = Mapping.Schema.getVirtual(model);
        const manager = this.database.collection(this.getCollectionName(model));
        const pipeline = [{ $match: filters_1.Filters.build(model, filter) }];
        for (const column of aggregate) {
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
            const group = this.getFieldsGrouping(row, virtual);
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
        return this.purgeNullFields(row, ...(await manager.aggregate(pipeline).toArray()));
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param value Entity id.
     * @param aggregate Aggregated entries.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(model, value, aggregate) {
        return (await this.find(model, this.getPrimaryFilter(model, value), aggregate))[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns the number of updated entities.
     */
    async update(model, filter, entity) {
        const manager = this.database.collection(this.getCollectionName(model));
        const result = await manager.updateMany(filters_1.Filters.build(model, filter), { $set: entity });
        return result.modifiedCount;
    }
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param value Entity id.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, value, entity) {
        return (await this.update(model, this.getPrimaryFilter(model, value), entity)) === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Filter columns.
     * @return Returns the number of deleted entities.
     */
    async delete(model, filter) {
        const manager = this.database.collection(this.getCollectionName(model));
        const result = await manager.deleteMany(filters_1.Filters.build(model, filter));
        return result.deletedCount || 0;
    }
    /**
     * Deletes the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param value Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, value) {
        return (await this.delete(model, this.getPrimaryFilter(model, value))) === 1;
    }
};
__decorate([
    Class.Private()
], Driver.prototype, "connection", void 0);
__decorate([
    Class.Private()
], Driver.prototype, "database", void 0);
__decorate([
    Class.Private()
], Driver.prototype, "options", void 0);
__decorate([
    Class.Private()
], Driver.prototype, "getCollectionName", null);
__decorate([
    Class.Private()
], Driver.prototype, "getCollectionOptions", null);
__decorate([
    Class.Private()
], Driver.prototype, "getPrimaryProperty", null);
__decorate([
    Class.Private()
], Driver.prototype, "getPrimaryFilter", null);
__decorate([
    Class.Private()
], Driver.prototype, "getFieldsGrouping", null);
__decorate([
    Class.Private()
], Driver.prototype, "purgeNullFields", null);
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
Driver = __decorate([
    Class.Describe()
], Driver);
exports.Driver = Driver;
