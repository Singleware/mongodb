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
/*
 * Copyright (C) 2018-2019 Silas B. Domingos
 * This source code is licensed under the MIT License as described in the file LICENSE.
 */
const Mongodb = require("mongodb");
const Class = require("@singleware/class");
const Mapping = require("@singleware/mapping");
const fields_1 = require("./fields");
const filters_1 = require("./filters");
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
                $jsonSchema: schemas_1.Schemas.build(Mapping.Schema.getRealRow(model, Mapping.Types.View.ALL))
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
        await this.database.command({ collMod: Mapping.Schema.getStorage(model), ...Driver_1.getCollectionSchema(model) });
    }
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    async createCollection(model) {
        await this.database.command({ create: Mapping.Schema.getStorage(model), ...Driver_1.getCollectionSchema(model) });
    }
    /**
     * Determines whether the collection from the specified model exists or not.
     * @param model Model type.
     * @returns Returns true when the collection exists, false otherwise.
     */
    async hasCollection(model) {
        return (await this.database.listCollections({ name: Mapping.Schema.getStorage(model) }).toArray()).length === 1;
    }
    /**
     * Inserts all specified entities into the database.
     * @param model Model type.
     * @param view View mode.
     * @param entities Entity list.
     * @returns Returns the list inserted entities.
     */
    async insert(model, view, entities) {
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return Object.values((await manager.insertMany(entities)).insertedIds);
    }
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param view View mode.
     * @param filter Field filters.
     * @param sort Sorting fields.
     * @param limit Result limits.
     * @returns Returns the  promise to get the list of entities found.
     * @returns Returns the list of entities found.
     */
    async find(model, view, filter, sort, limit) {
        const pipeline = [];
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        fields_1.Fields.applyFilters(pipeline, model, filter);
        fields_1.Fields.applyRelations(pipeline, model, view);
        let cursor = manager.aggregate(pipeline);
        if (sort) {
            cursor = cursor.sort(fields_1.Fields.getSorting(sort));
        }
        if (limit) {
            cursor = limit ? cursor.skip(limit.start).limit(limit.count) : cursor;
        }
        return fields_1.Fields.purgeNull(model, view, await cursor.toArray());
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param view View mode.
     * @param id Entity id.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(model, view, id) {
        return (await this.find(model, view, fields_1.Fields.getPrimaryFilter(model, id)))[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param view View mode.
     * @param filter Fields filter.
     * @param entity Entity to be updated.
     * @returns Returns the number of updated entities.
     */
    async update(model, view, filter, entity) {
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return (await manager.updateMany(filters_1.Filters.build(model, filter), { $set: entity })).modifiedCount;
    }
    /**
     * Updates the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param view View mode.
     * @param id Entity id.
     * @param entity Entity to be updated.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, view, id, entity) {
        return (await this.update(model, view, fields_1.Fields.getPrimaryFilter(model, id), entity)) === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param filter Fields filter.
     * @return Returns the number of deleted entities.
     */
    async delete(model, filter) {
        const manager = this.database.collection(Mapping.Schema.getStorage(model));
        return (await manager.deleteMany(filters_1.Filters.build(model, filter))).deletedCount || 0;
    }
    /**
     * Deletes the entity that corresponds to the specified id.
     * @param model Model type.
     * @param id Entity id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, id) {
        return (await this.delete(model, fields_1.Fields.getPrimaryFilter(model, id))) === 1;
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
    Class.Private()
], Driver, "options", void 0);
__decorate([
    Class.Private()
], Driver, "getCollectionSchema", null);
Driver = Driver_1 = __decorate([
    Class.Describe()
], Driver);
exports.Driver = Driver;
