"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Session = void 0;
const Class = require("@singleware/class");
const Types = require("./types");
const Engine = require("./engine");
/**
 * MongoDb session driver class.
 */
let Session = class Session extends Class.Null {
    /**
     * Default constructor.
     * @param client Session client.
     * @param input Specify a managed session instance or a dynamic session options.
     */
    constructor(client, input) {
        super();
        this.client = client;
        this.database = client.db();
        if (input instanceof Function) {
            this.session = input;
        }
        else {
            this.options = input;
        }
    }
    /**
     * Perform the specified callback in the transactional mode.
     * @param callback Transaction callback.
     * @param options Transaction options.
     * @throws Throws an exception when there's any error in the transaction.
     * @returns Returns the same value returned by the given callback.
     */
    async transaction(callback, options) {
        if (this.session !== void 0 && this.session.inTransaction()) {
            return await callback();
        }
        else {
            let dynamic = false;
            let result;
            let caught;
            try {
                if (this.session === void 0) {
                    this.session = this.client.startSession(this.options);
                    dynamic = true;
                }
                await this.session.withTransaction(async () => {
                    result = await callback();
                }, options);
            }
            catch (exception) {
                caught = exception;
            }
            finally {
                if (dynamic) {
                    this.session.endSession();
                    this.session = void 0;
                }
                if (caught) {
                    throw caught;
                }
                return result;
            }
        }
    }
    /**
     * Insert all specified entities into the database.
     * @param model Model type.
     * @param entities Entity list.
     * @returns Returns a promise to get the list of inserted entities.
     */
    async insert(model, entities) {
        const entries = entities.map((entity) => Types.Normalizer.create(model, entity, true, true));
        const collection = this.database.collection(Types.Schema.getStorageName(model));
        const result = await collection.insertMany(entries, { session: this.session });
        return Object.values(result.insertedIds);
    }
    /**
     * Find the corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the list of entities found.
     */
    async find(model, query, fields) {
        const pipeline = Engine.Pipeline.build(model, query, fields);
        const collection = this.database.collection(Types.Schema.getStorageName(model));
        const cursor = collection.aggregate(pipeline, { session: this.session, allowDiskUse: true });
        return await cursor.toArray();
    }
    /**
     * Find the entity that corresponds to the specified entity id.
     * @param model Model type.
     * @param id Entity id.
     * @param fields Viewed fields.
     * @returns Returns a promise to get the found entity or undefined when the entity was not found.
     */
    async findById(model, id, fields) {
        const result = await this.find(model, { pre: Engine.Filter.primaryId(model, id) }, fields);
        if (result) {
            return result[0];
        }
        return void 0;
    }
    /**
     * Update all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @param entity Entity data.
     * @returns Returns a promise to get the number of updated entities.
     */
    async update(model, match, entity) {
        const entry = Types.Normalizer.create(model, entity, true, true, true);
        const filter = Engine.Match.build(model, match);
        const collection = this.database.collection(Types.Schema.getStorageName(model));
        const result = await collection.updateMany(filter, { $set: entry }, { session: this.session });
        return result.modifiedCount;
    }
    /**
     * Updates the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been updated or false otherwise.
     */
    async updateById(model, id, entity) {
        return (await this.update(model, Engine.Filter.primaryId(model, id), entity)) === 1;
    }
    /**
     * Replace the entity that corresponds to the specified entity Id.
     * @param model Model type.
     * @param id Entity Id.
     * @param entity Entity data.
     * @returns Returns a promise to get the true when the entity has been replaced or false otherwise.
     */
    async replaceById(model, id, entity) {
        const entry = Types.Normalizer.create(model, entity, true, true);
        const filter = Engine.Match.build(model, Engine.Filter.primaryId(model, id));
        const collection = this.database.collection(Types.Schema.getStorageName(model));
        const result = await collection.replaceOne(filter, entry, { session: this.session });
        return result.modifiedCount === 1;
    }
    /**
     * Delete all entities that corresponds to the specified filter.
     * @param model Model type.
     * @param match Matching filter.
     * @return Returns a promise to get the number of deleted entities.
     */
    async delete(model, match) {
        var _a;
        const filter = Engine.Match.build(model, match);
        const collection = this.database.collection(Types.Schema.getStorageName(model));
        const result = await collection.deleteMany(filter, { session: this.session });
        return (_a = result.deletedCount) !== null && _a !== void 0 ? _a : 0;
    }
    /**
     * Delete the entity that corresponds to the specified Id.
     * @param model Model type.
     * @param id Entity Id.
     * @return Returns a promise to get the true when the entity has been deleted or false otherwise.
     */
    async deleteById(model, id) {
        return (await this.delete(model, Engine.Filter.primaryId(model, id))) === 1;
    }
    /**
     * Count all corresponding entities from the database.
     * @param model Model type.
     * @param query Query filter.
     * @returns Returns a promise to get the total amount of found entities.
     */
    async count(model, query) {
        var _a, _b;
        const pipeline = [...Engine.Pipeline.build(model, query, []), { $count: 'records' }];
        const collection = this.database.collection(Types.Schema.getStorageName(model));
        const cursor = collection.aggregate(pipeline, { session: this.session, allowDiskUse: true });
        return (_b = (_a = (await cursor.toArray())[0]) === null || _a === void 0 ? void 0 : _a.records) !== null && _b !== void 0 ? _b : 0;
    }
};
__decorate([
    Class.Private()
], Session.prototype, "client", void 0);
__decorate([
    Class.Private()
], Session.prototype, "database", void 0);
__decorate([
    Class.Private()
], Session.prototype, "options", void 0);
__decorate([
    Class.Private()
], Session.prototype, "session", void 0);
__decorate([
    Class.Public()
], Session.prototype, "transaction", null);
__decorate([
    Class.Public()
], Session.prototype, "insert", null);
__decorate([
    Class.Public()
], Session.prototype, "find", null);
__decorate([
    Class.Public()
], Session.prototype, "findById", null);
__decorate([
    Class.Public()
], Session.prototype, "update", null);
__decorate([
    Class.Public()
], Session.prototype, "updateById", null);
__decorate([
    Class.Public()
], Session.prototype, "replaceById", null);
__decorate([
    Class.Public()
], Session.prototype, "delete", null);
__decorate([
    Class.Public()
], Session.prototype, "deleteById", null);
__decorate([
    Class.Public()
], Session.prototype, "count", null);
Session = __decorate([
    Class.Describe()
], Session);
exports.Session = Session;
//# sourceMappingURL=session.js.map