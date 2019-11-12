"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Driver_1;
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Mongodb = require("mongodb");
const Class = require("@singleware/class");
const Aliases = require("./aliases");
const Engine = require("./engine");
/**
 * MongoDb driver class.
 */
let Driver = Driver_1 = class Driver extends Class.Null {
    /**
     * Build and get the collection schema.
     * @param model Model type.
     * @returns Returns the collection validation object.
     */
    static getCollectionSchema(model) {
        return {
            validator: {
                $jsonSchema: Engine.Schema.build(Aliases.Schema.getRealRow(model))
            },
            validationLevel: 'strict',
            validationAction: 'error'
        };
    }
    /**
     * Connect to the specified URI.
     * @param uri Connection URI.
     * @throws Throws an error when there's an active connection.
     */
    async connect(uri) {
        if (this.connection) {
            throw new Error(`An active connection was found.`);
        }
        this.connection = await Mongodb.MongoClient.connect(uri, Driver_1.options);
        this.database = this.connection.db();
    }
    /**
     * Disconnect the active connection.
     * @throws Throws an error when there's no active connection.
     */
    async disconnect() {
        if (!this.connection) {
            throw new Error(`No connection found.`);
        }
        await this.connection.close();
        this.connection = void 0;
        this.database = void 0;
    }
    /**
     * Modify the collection by the specified model type.
     * @param model Model type.
     */
    async modifyCollection(model) {
        await this.database.command({
            collMod: Aliases.Schema.getStorageName(model),
            ...Driver_1.getCollectionSchema(model)
        });
    }
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    async createCollection(model) {
        await this.database.command({
            create: Aliases.Schema.getStorageName(model),
            ...Driver_1.getCollectionSchema(model)
        });
    }
    /**
     * Determines whether the collection from the specified model exists or not.
     * @param model Model type.
     * @returns Returns a promise to get true when the collection exists, false otherwise.
     */
    async hasCollection(model) {
        const filter = { name: Aliases.Schema.getStorageName(model) };
        return (await this.database.listCollections(filter, { nameOnly: true }).toArray()).length === 1;
    }
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    async insert(model, entities) {
        const manager = this.database.collection(Aliases.Schema.getStorageName(model));
        const entries = entities.map(entity => Aliases.Normalizer.create(model, entity, true, true));
        return Object.values((await manager.insertMany(entries)).insertedIds);
    }
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(model, query, fields) {
        const manager = this.database.collection(Aliases.Schema.getStorageName(model));
        const pipeline = Engine.Pipeline.build(model, query, fields);
        return (await manager.aggregate(pipeline, { allowDiskUse: true })).toArray();
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(model, id, fields) {
        const match = Engine.Filter.primaryId(model, id);
        return (await this.find(model, { pre: match }, fields))[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(model, match, entity) {
        const manager = this.database.collection(Aliases.Schema.getStorageName(model));
        const entry = Aliases.Normalizer.create(model, entity, true, true, true);
        const filter = Engine.Match.build(model, match);
        return (await manager.updateMany(filter, { $set: entry })).modifiedCount;
    }
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, id, entity) {
        const match = Engine.Filter.primaryId(model, id);
        return (await this.update(model, match, entity)) === 1;
    }
    /**
     * Replace the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceById(model, id, entity) {
        const manager = this.database.collection(Aliases.Schema.getStorageName(model));
        const entry = Aliases.Normalizer.create(model, entity, true, true);
        const match = Engine.Filter.primaryId(model, id);
        const filter = Engine.Match.build(model, match);
        return (await manager.replaceOne(filter, entry)).modifiedCount === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(model, match) {
        const manager = this.database.collection(Aliases.Schema.getStorageName(model));
        const filter = Engine.Match.build(model, match);
        return (await manager.deleteMany(filter)).deletedCount || 0;
    }
    /**
     * Deletes the entity that corresponds to the specified id.
     * @param model Model type.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, id) {
        const match = Engine.Filter.primaryId(model, id);
        return (await this.delete(model, match)) === 1;
    }
    /**
     * Count all corresponding entities from the storage.
     * @param model Model type.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(model, query) {
        const manager = this.database.collection(Aliases.Schema.getStorageName(model));
        const pipeline = [...Engine.Pipeline.build(model, query, []), { $count: 'records' }];
        const result = await manager.aggregate(pipeline, { allowDiskUse: true }).toArray();
        return result.length ? result[0].records || 0 : 0;
    }
};
/**
 * Connection options.
 */
Driver.options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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
], Driver.prototype, "modifyCollection", null);
__decorate([
    Class.Public()
], Driver.prototype, "createCollection", null);
__decorate([
    Class.Public()
], Driver.prototype, "hasCollection", null);
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
], Driver.prototype, "replaceById", null);
__decorate([
    Class.Public()
], Driver.prototype, "delete", null);
__decorate([
    Class.Public()
], Driver.prototype, "deleteById", null);
__decorate([
    Class.Public()
], Driver.prototype, "count", null);
__decorate([
    Class.Private()
], Driver, "options", void 0);
__decorate([
    Class.Private()
], Driver, "getCollectionSchema", null);
Driver = Driver_1 = __decorate([
    Class.Describe()
], Driver);
exports.Driver = Driver;
//# sourceMappingURL=driver.js.map