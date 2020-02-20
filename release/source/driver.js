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
     * Check if there's an active connection.
     * @throws Throws an error when there's no active connection.
     */
    isActiveConnection(client) {
        if (client === void 0) {
            throw new Error(`No connection found.`);
        }
        return true;
    }
    /**
     * Build and get the collection schema.
     * @param model Model type.
     * @returns Returns the collection validation object.
     */
    getCollectionSchema(model) {
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
     * @param options Connection options.
     * @throws Throws an error when there's an active connection.
     */
    async connect(uri, options) {
        if (this.client) {
            throw new Error(`An active connection was found.`);
        }
        this.client = await Mongodb.MongoClient.connect(uri, {
            ...Driver_1.options,
            ...options
        });
        this.client.on('close', () => {
            this.client = void 0;
        });
    }
    /**
     * Disconnect the active connection.
     * @throws Throws an error when there's no active connection.
     */
    async disconnect() {
        if (this.isActiveConnection(this.client)) {
            await this.client.close();
        }
    }
    /**
     * Modify the collection by the specified model type.
     * @param model Model type.
     */
    async modifyCollection(model) {
        if (this.isActiveConnection(this.client)) {
            await this.client.db().command({
                collMod: Aliases.Schema.getStorageName(model),
                ...this.getCollectionSchema(model)
            });
        }
    }
    /**
     * Creates a new collection by the specified model type.
     * @param model Model type.
     */
    async createCollection(model) {
        if (this.isActiveConnection(this.client)) {
            await this.client.db().command({
                create: Aliases.Schema.getStorageName(model),
                ...this.getCollectionSchema(model)
            });
        }
    }
    /**
     * Determines whether or not the collection for the given model type exists.
     * @param model Model type.
     * @returns Returns a promise to get true when the collection exists, false otherwise.
     */
    async hasCollection(model) {
        if (this.isActiveConnection(this.client)) {
            const filter = { name: Aliases.Schema.getStorageName(model) };
            const manager = this.client.db();
            const options = { nameOnly: true };
            const result = await manager.listCollections(filter, options).toArray();
            return result.length === 1;
        }
        return false;
    }
    /**
     * Run the specified callback in the transactional mode.
     * @param callback Transaction callback.
     * @param options Transaction options.
     * @throws Throws an exception when there's any error in the transaction.
     * @returns Returns the same value returned by the given callback.
     */
    async runTransaction(callback, options) {
        let result;
        if (this.isActiveConnection(this.client)) {
            if (!this.session) {
                let caught;
                this.session = this.client.startSession();
                try {
                    await this.session.withTransaction(async () => (result = await callback()), options);
                }
                catch (exception) {
                    caught = exception;
                }
                finally {
                    await this.session.endSession();
                    this.session = void 0;
                    if (caught) {
                        throw caught;
                    }
                }
            }
            else {
                result = await callback();
            }
        }
        return result;
    }
    /**
     * Insert all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    async insert(model, entities) {
        if (this.isActiveConnection(this.client)) {
            const entries = entities.map(entity => Aliases.Normalizer.create(model, entity, true, true));
            const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
            const options = { session: this.session };
            const result = await manager.insertMany(entries, options);
            return Object.values(result.insertedIds);
        }
        return [];
    }
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(model, query, fields) {
        if (this.isActiveConnection(this.client)) {
            const pipeline = Engine.Pipeline.build(model, query, fields);
            const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
            const options = { session: this.session, allowDiskUse: true };
            const result = await manager.aggregate(pipeline, options).toArray();
            return result;
        }
        return [];
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
        const result = await this.find(model, { pre: match }, fields);
        return result[0];
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(model, match, entity) {
        if (this.isActiveConnection(this.client)) {
            const entry = Aliases.Normalizer.create(model, entity, true, true, true);
            const filter = Engine.Match.build(model, match);
            const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
            const options = { session: this.session };
            const result = await manager.updateMany(filter, { $set: entry }, options);
            return result.modifiedCount;
        }
        return 0;
    }
    /**
     * Updates the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, id, entity) {
        const match = Engine.Filter.primaryId(model, id);
        const result = await this.update(model, match, entity);
        return result === 1;
    }
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceById(model, id, entity) {
        if (this.isActiveConnection(this.client)) {
            const entry = Aliases.Normalizer.create(model, entity, true, true);
            const match = Engine.Filter.primaryId(model, id);
            const filter = Engine.Match.build(model, match);
            const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
            const options = { session: this.session };
            const result = await manager.replaceOne(filter, entry, options);
            return result.modifiedCount === 1;
        }
        return false;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(model, match) {
        var _a;
        if (this.isActiveConnection(this.client)) {
            const filter = Engine.Match.build(model, match);
            const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
            const option = { session: this.session };
            const result = await manager.deleteMany(filter, option);
            return _a = result.deletedCount, (_a !== null && _a !== void 0 ? _a : 0);
        }
        return 0;
    }
    /**
     * Delete the entity that corresponds to the specified Id.
     * @param model Model type.
     * @param id Entity Id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, id) {
        const match = Engine.Filter.primaryId(model, id);
        const result = await this.delete(model, match);
        return result === 1;
    }
    /**
     * Count all corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(model, query) {
        var _a, _b;
        if (this.isActiveConnection(this.client)) {
            const pipeline = [...Engine.Pipeline.build(model, query, []), { $count: 'records' }];
            const manager = this.client.db().collection(Aliases.Schema.getStorageName(model));
            const option = { session: this.session, allowDiskUse: true };
            const result = await manager.aggregate(pipeline, option).toArray();
            return _b = (_a = result[0]) === null || _a === void 0 ? void 0 : _a.records, (_b !== null && _b !== void 0 ? _b : 0);
        }
        return 0;
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
], Driver.prototype, "client", void 0);
__decorate([
    Class.Private()
], Driver.prototype, "session", void 0);
__decorate([
    Class.Private()
], Driver.prototype, "isActiveConnection", null);
__decorate([
    Class.Private()
], Driver.prototype, "getCollectionSchema", null);
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
], Driver.prototype, "runTransaction", null);
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
Driver = Driver_1 = __decorate([
    Class.Describe()
], Driver);
exports.Driver = Driver;
//# sourceMappingURL=driver.js.map