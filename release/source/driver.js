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
const filters_1 = require("./filters");
const schemas_1 = require("./schemas");
/**
 * Mongo DB driver class.
 */
let Driver = class Driver {
    /**
     * Mongo DB driver class.
     */
    constructor() {
        /**
         * Driver connection options.
         */
        this.options = {
            useNewUrlParser: true,
            ignoreUndefined: true
        };
    }
    /**
     * Connect to the MongoDb URI.
     * @param uri Connection URI.
     */
    async connect(uri) {
        await new Promise((resolve, reject) => {
            Source.MongoClient.connect(uri, this.options, (error, connection) => {
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
     * Modifies the collection by the specified row schema.
     * @param collection Collection name.
     * @param schema Row schema.
     */
    async modify(collection, schema) {
        this.database.command({
            collMod: collection,
            validator: {
                $jsonSchema: schemas_1.Schemas.build(schema)
            },
            validationLevel: 'strict',
            validationAction: 'error'
        });
    }
    /**
     * Insert the specified entity into the database.
     * @param collection Collection name.
     * @param entities Entity data list.
     * @returns Returns the list inserted entities.
     */
    async insert(collection, ...entities) {
        const manager = this.database.collection(collection);
        const result = await manager.insertMany(entities);
        return Object.values(result.insertedIds);
    }
    /**
     * Find the corresponding entity from the database.
     * @param collection Collection name.
     * @param filter Filter expression.
     * @returns Returns the list of entities found.
     */
    async find(collection, filter) {
        const manager = this.database.collection(collection);
        const cursor = await manager.find(filters_1.Filters.build(filter));
        return await cursor.toArray();
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param collection Collection name.
     * @param column Id column name.
     * @param id Entity id value.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(collection, column, id) {
        const filters = {};
        filters[column] = { operator: Mapping.Operators.EQUAL, value: id };
        return (await this.find(collection, filters))[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param collection Collection name.
     * @param filter Filter expression.
     * @param entity Entity data to be updated.
     * @returns Returns the number of updated entities.
     */
    async update(collection, filter, entity) {
        const manager = this.database.collection(collection);
        const result = await manager.updateMany(filters_1.Filters.build(filter), { $set: entity });
        return result.modifiedCount;
    }
    /**
     * Update the entity that corresponds to the specified entity id.
     * @param collection Collection name.
     * @param column Column name.
     * @param id Entity id.
     * @param entity Entity data to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(collection, column, id, entity) {
        const filters = {};
        filters[column] = { operator: Mapping.Operators.EQUAL, value: id };
        return (await this.update(collection, filters, entity)) === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param collection Collection name.
     * @param filter Filter columns.
     * @return Returns the number of deleted entities.
     */
    async delete(collection, filter) {
        const manager = this.database.collection(collection);
        const result = await manager.deleteMany(filters_1.Filters.build(filter));
        return result.deletedCount || 0;
    }
    /**
     * Delete the entity that corresponds to the specified entity id.
     * @param collection Collection name.
     * @param column Column name.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(collection, column, id) {
        const filters = {};
        filters[column] = { operator: Mapping.Operators.EQUAL, value: id };
        return (await this.delete(collection, filters)) === 1;
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
