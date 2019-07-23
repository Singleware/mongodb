"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Driver_1;
Object.defineProperty(exports, "__esModule", { value: true });
"use strict";
/*!
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Mongodb = require("mongodb");
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const filters_1 = require("./filters");
const matches_1 = require("./matches");
const schemas_1 = require("./schemas");
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
                $jsonSchema: schemas_1.Schemas.build(Mapping.Schema.getRealRow(model))
            },
            validationLevel: 'strict',
            validationAction: 'error'
        };
    }
    /**
     * Connect to the URI.
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
     * Disconnect any active connection.
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
     * Modify the collection by the specified model type.
     * @param model Model type.
     */
    async modifyCollection(model) {
        await this.database.command({
            collMod: Mapping.Schema.getStorage(model),
            ...Driver_1.getCollectionSchema(model)
        });
    }
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    async createCollection(model) {
        await this.database.command({
            create: Mapping.Schema.getStorage(model),
            ...Driver_1.getCollectionSchema(model)
        });
    }
    /**
     * Determines whether the collection from the specified model exists or not.
     * @param model Model type.
     * @returns Returns a promise to get true when the collection exists, false otherwise.
     */
    async hasCollection(model) {
        const filter = { name: Mapping.Schema.getStorage(model) };
        const options = { nameOnly: true };
        return (await this.database.listCollections(filter, options).toArray()).length === 1;
    }
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    async insert(model, entities) {
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return Object.values((await manager.insertMany(entities)).insertedIds);
    }
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param filter Field filter.
     * @param fields Fields to be selected.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(model, filter, fields) {
        const pipeline = filters_1.Filters.getPipeline(model, filter, fields);
        const settings = { allowDiskUse: true };
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return (await manager.aggregate(pipeline, settings)).toArray();
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param fields Fields to be selected.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(model, id, fields) {
        return (await this.find(model, { pre: filters_1.Filters.getPrimaryIdMatch(model, id) }, fields))[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching fields.
     * @param entity Entity to be updated.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(model, match, entity) {
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return (await manager.updateMany(matches_1.Matches.build(model, match), { $set: entity })).modifiedCount;
    }
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param entity Entity to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, id, entity) {
        return (await this.update(model, filters_1.Filters.getPrimaryIdMatch(model, id), entity)) === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching fields.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(model, match) {
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return (await manager.deleteMany(matches_1.Matches.build(model, match))).deletedCount || 0;
    }
    /**
     * Deletes the entity that corresponds to the specified id.
     * @param model Model type.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, id) {
        return (await this.delete(model, filters_1.Filters.getPrimaryIdMatch(model, id))) === 1;
    }
    /**
     * Count all corresponding entities from the storage.
     * @param model Model type.
     * @param filter Field field.
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(model, filter) {
        const pipeline = [...filters_1.Filters.getPipeline(model, filter, []), { $count: 'records' }];
        const settings = { allowDiskUse: true };
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        const result = await manager.aggregate(pipeline, settings).toArray();
        return result.length ? result[0].records || 0 : 0;
    }
};
/**
 * Connection options.
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